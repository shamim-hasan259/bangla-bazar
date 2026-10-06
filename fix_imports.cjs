const fs = require('fs');
const files = [
  'src/app/dashboard/admin/sales/create-order/columns.tsx',
  'src/app/dashboard/admin/sales/create-order/return-product-column.tsx',
  'src/app/dashboard/admin/sales/create-order/soldProductColumn.tsx',
  'src/app/dashboard/seller/sales/create-order/columns.tsx',
  'src/app/dashboard/seller/sales/create-order/return-product-column.tsx',
  'src/app/dashboard/seller/sales/create-order/soldProductColumn.tsx',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import \{ handleDelete \} from "\.\.\/\.\.\/tpn\/_action";\r?\n?/g, '');
    content = content.replace(/const handleDeleteTrigger = async \(id: string\) => \{[\s\S]*?\};\r?\n?/g, '');
    fs.writeFileSync(file, content);
  }
});

let selectPO = 'src/components/ui/selectPO.tsx';
if (fs.existsSync(selectPO)) {
  let selectPOContent = fs.readFileSync(selectPO, 'utf8');
  selectPOContent = selectPOContent.replace(/@\/app\/dashboard\/admin\/po\/_action/g, '@/app/dashboard/seller/po/_action');
  fs.writeFileSync(selectPO, selectPOContent);
}
console.log("Fixed files");
