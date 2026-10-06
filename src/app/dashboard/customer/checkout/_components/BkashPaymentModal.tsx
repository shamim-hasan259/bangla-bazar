"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BkashPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { bkashNumber: string; transactionId: string }) => void;
    onSwitchToGateway?: () => void;
    loading: boolean;
    totalAmount: number;
}

export function BkashPaymentModal({
    isOpen,
    onClose,
    onConfirm,
    onSwitchToGateway,
    loading,
    totalAmount,
}: BkashPaymentModalProps) {
    const [bkashNumber, setBkashNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!bkashNumber || !transactionId) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        onConfirm({ bkashNumber, transactionId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bkash Payment</DialogTitle>
                    <DialogDescription>
                        Please pay <strong>৳{totalAmount}</strong> to the following Bkash Merchant Number.
                        <br />
                        <br />
                        <span className="font-bold text-lg select-all text-primary bg-muted p-2 rounded">01700000000</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bkashNumber" className="text-right">
                            Your Number
                        </Label>
                        <Input
                            id="bkashNumber"
                            placeholder="017..."
                            className="col-span-3"
                            value={bkashNumber}
                            onChange={(e) => setBkashNumber(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trxId" className="text-right">
                            Trx ID
                        </Label>
                        <Input
                            id="trxId"
                            placeholder="8N7..."
                            className="col-span-3"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="sm:flex-1">
                        Cancel
                    </Button>
                    {onSwitchToGateway && (
                        <Button variant="secondary" onClick={onSwitchToGateway} disabled={loading} className="sm:flex-1 bg-pink-100 text-pink-700 hover:bg-pink-200">
                            Pay via Gateway
                        </Button>
                    )}
                    <Button onClick={handleConfirm} disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white sm:flex-1">
                        {loading ? "Processing..." : "Confirm Order"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
