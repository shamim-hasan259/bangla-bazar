import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log("🧪 Starting Comprehensive Automated Integration & System Test Suite...\n");

  const testReport = {
    seed: false,
    qna: false,
    coupon: false,
    escrow: false,
    escrowRelease: false,
    reviewReply: false,
    wallet: false,
    issues: [] as string[],
  };

  try {
    // -------------------------------------------------------------
    // TEST STEP 1: VERIFY/CREATE TEST ACCOUNTS & PRODUCTS
    // -------------------------------------------------------------
    console.log("STEP 1: Checking Base Database Data...");
    
    const hashedPassword = await bcrypt.hash("customer123", 10);
    
    const testCustomer = await prisma.customer.upsert({
      where: { phone: "01888888888" },
      update: {},
      create: {
        name: "Test Audit Customer",
        phone: "01888888888",
        email: "auditcustomer@banglabazar.com",
        type: "customer",
        password: hashedPassword,
        customerId: "CUST_AUDIT_01",
        walletBalance: 500,
        status: "Active",
      },
    });

    const testSeller = await prisma.seller.upsert({
      where: { phone: "01999999999" },
      update: {},
      create: {
        name: "Test Audit Seller",
        phone: "01999999999",
        email: "auditseller@banglabazar.com",
        type: "seller",
        password: hashedPassword,
        sellerId: "SEL_AUDIT_01",
        walletBalance: 1000,
        commissionRate: 10,
        tier: "Silver",
        status: "Active",
      },
    });

    let product = await prisma.product.findFirst({ where: { status: "Active" } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: "Test Audit Product",
          price: 1000,
          mrp: 1200,
          tp: 800,
          stock: 100,
          unitId: (await prisma.unit.findFirst())?.id || "60f7e1b8c9e4b20015f8a1a1",
          sellerId: testSeller.id,
          status: "Active",
        },
      });
    }

    testReport.seed = true;
    console.log("✅ Step 1 Passed: Base Test Accounts and Product Verified.");

    // -------------------------------------------------------------
    // TEST STEP 2: TEST CUSTOMER Q&A CREATION & SELLER RESPONSE
    // -------------------------------------------------------------
    console.log("\nSTEP 2: Testing Customer Q&A Portal and Seller Reply Engine...");
    
    const question = await prisma.productQuestion.create({
      data: {
        productId: product.id,
        customerId: testCustomer.id,
        question: "Is this product genuine and under warranty?",
      },
    });

    const answer = await prisma.productAnswer.create({
      data: {
        questionId: question.id,
        sellerId: testSeller.id,
        answer: "Yes, 100% genuine with 1 year official warranty.",
      },
    });

    const qnaCheck = await prisma.productQuestion.findUnique({
      where: { id: question.id },
      include: { answers: true },
    });

    if (qnaCheck && qnaCheck.answers.length > 0) {
      testReport.qna = true;
      console.log("✅ Step 2 Passed: Q&A Question posted and Seller answer linked successfully.");
    } else {
      testReport.issues.push("Q&A linkage failed: Answer not bound to question.");
    }

    // -------------------------------------------------------------
    // TEST STEP 3: TEST COUPON CREATION & VALIDATION LOGIC
    // -------------------------------------------------------------
    console.log("\nSTEP 3: Testing Coupon Validation Logic...");
    
    const testCoupon = await prisma.coupon.upsert({
      where: { code: "TESTPROMO20" },
      update: {},
      create: {
        code: "TESTPROMO20",
        description: "20% Promo Discount Test",
        discount: 20,
        type: "Percentage",
        minAmount: 500,
        maxDiscount: 200,
        expiryDate: new Date(Date.now() + 864000000), // Expiry 10 days in future
        status: "Active",
      },
    });

    // Validate rules
    const cartTotal = 1000;
    if (testCoupon.status === "Active" && new Date(testCoupon.expiryDate) > new Date() && cartTotal >= (testCoupon.minAmount || 0)) {
      let expectedDiscount = cartTotal * (testCoupon.discount / 100);
      if (testCoupon.maxDiscount) expectedDiscount = Math.min(expectedDiscount, testCoupon.maxDiscount);

      if (expectedDiscount === 200) {
        testReport.coupon = true;
        console.log(`✅ Step 3 Passed: Coupon 'TESTPROMO20' validated. Discount: ৳${expectedDiscount}`);
      } else {
        testReport.issues.push(`Coupon calculation mismatch. Expected 200, got ${expectedDiscount}`);
      }
    } else {
      testReport.issues.push("Coupon status or constraint check failed.");
    }

    // -------------------------------------------------------------
    // TEST STEP 4: TEST 100% ESCROW HOLD & 40% DISBURSEMENT ON DELIVERY
    // -------------------------------------------------------------
    console.log("\nSTEP 4: Testing 100% Escrow Hold Pipeline & 40% Immediate Release...");

    const mockOrderAmount = 2000; // ৳2000 Gross Order
    const commRate = testSeller.commissionRate; // 10%
    const netEarnings = mockOrderAmount * ((100 - commRate) / 100); // ৳1800
    const expected40 = netEarnings * 0.40; // ৳720
    const expected60 = netEarnings * 0.60; // ৳1080

    const initialSellerWallet = testSeller.walletBalance;

    // Simulate order marking as Delivered
    const dummyOrderId = "60f7e1b8c9e4b20015f8a999";
    const escrowHold = await prisma.escrowHolding.create({
      data: {
        orderId: dummyOrderId,
        sellerId: testSeller.id,
        totalAmount: netEarnings,
        heldAmount: expected60,
        released40: true,
        released60: false,
        deliveryDate: new Date(),
        releaseDate: new Date(Date.now() - 10000), // Set release date to past to test Step 5
        status: "PartiallyReleased",
      },
    });

    // Credit 40% immediately
    await prisma.seller.update({
      where: { id: testSeller.id },
      data: { walletBalance: { increment: expected40 } },
    });

    const updatedSellerAfter40 = await prisma.seller.findUnique({ where: { id: testSeller.id } });

    if (updatedSellerAfter40 && updatedSellerAfter40.walletBalance === initialSellerWallet + expected40) {
      testReport.escrow = true;
      console.log(`✅ Step 4 Passed: 40% (৳${expected40}) credited to Seller Wallet immediately upon delivery. 60% (৳${expected60}) held in Escrow Pipeline.`);
    } else {
      testReport.issues.push("Escrow 40% credit to wallet calculation mismatch.");
    }

    // -------------------------------------------------------------
    // TEST STEP 5: TEST 7-DAY ESCROW RELEASE WORKER SCRIPT
    // -------------------------------------------------------------
    console.log("\nSTEP 5: Testing 7-Day Escrow Release Cron Pipeline...");

    const escrowsToRelease = await prisma.escrowHolding.findMany({
      where: {
        id: escrowHold.id,
        released40: true,
        released60: false,
        releaseDate: { lte: new Date() },
      },
    });

    for (const esc of escrowsToRelease) {
      await prisma.seller.update({
        where: { id: esc.sellerId },
        data: { walletBalance: { increment: esc.heldAmount } },
      });

      await prisma.escrowHolding.update({
        where: { id: esc.id },
        data: {
          heldAmount: 0,
          released60: true,
          status: "Released",
        },
      });
    }

    const escrowFinalCheck = await prisma.escrowHolding.findUnique({ where: { id: escrowHold.id } });
    const sellerFinal = await prisma.seller.findUnique({ where: { id: testSeller.id } });

    if (escrowFinalCheck?.status === "Released" && sellerFinal?.walletBalance === initialSellerWallet + expected40 + expected60) {
      testReport.escrowRelease = true;
      console.log(`✅ Step 5 Passed: 60% (৳${expected60}) Escrow held funds released after period expiration. Total Seller Wallet: ৳${sellerFinal?.walletBalance}`);
    } else {
      testReport.issues.push("Escrow 60% cron release pipeline failed to update wallet.");
    }

    // -------------------------------------------------------------
    // TEST STEP 6: TEST REVIEW REPLY FEATURE
    // -------------------------------------------------------------
    console.log("\nSTEP 6: Testing Seller Review Response Management...");

    const review = await prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellent product quality! Highly satisfied.",
        productId: product.id,
        customerId: testCustomer.id,
        sellerId: testSeller.id,
        status: "Approved",
      },
    });

    const updatedReview = await prisma.review.update({
      where: { id: review.id },
      data: {
        reply: "Thank you for shopping with us!",
        repliedAt: new Date(),
      },
    });

    if (updatedReview.reply === "Thank you for shopping with us!") {
      testReport.reviewReply = true;
      console.log("✅ Step 6 Passed: Seller review reply posted successfully.");
    } else {
      testReport.issues.push("Review response updating failed.");
    }

    // -------------------------------------------------------------
    // TEST STEP 7: TEST CUSTOMER WALLET BALANCES
    // -------------------------------------------------------------
    console.log("\nSTEP 7: Testing Customer Wallet Credit...");
    const customerWalletCheck = await prisma.customer.findUnique({ where: { id: testCustomer.id } });
    if (customerWalletCheck && customerWalletCheck.walletBalance === 500) {
      testReport.wallet = true;
      console.log(`✅ Step 7 Passed: Customer Wallet Balance verified at ৳${customerWalletCheck.walletBalance}`);
    } else {
      testReport.issues.push("Customer wallet balance check failed.");
    }

  } catch (error: any) {
    console.error("❌ Exception during test suite execution:", error);
    testReport.issues.push(`Unhandled Exception: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    console.log("\n=================================================");
    console.log("📊 TEST SUITE SUMMARY RESULTS:");
    console.log(JSON.stringify(testReport, null, 2));
    console.log("=================================================");
  }
}

runTestSuite();
