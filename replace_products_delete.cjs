const fs = require('fs');

let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

// Replace the inline handlers with proper prompt logic
const newHandler1 = `onClick={() => {
                        requireAdminAuth('أرشفة منتج', () => {
                          const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
                          if (!reason || reason.trim() === '') {
                            alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
                            return;
                          }
                          if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
                            deleteMutation.mutate({ prod: p, reason });
                          }
                        });
                      }}`;

code = code.replace(/onClick=\{\(\) => \{\s*requireAdminAuth\('حذف منتج', \(\) => \{\s*if \(confirm\('تأكيد الحذف؟'\)\) deleteMutation\.mutate\(p\);\s*\}\);\s*\}\}/g, newHandler1);

const newHandler2 = `onClick={() => {
                      requireAdminAuth('أرشفة منتج', () => {
                        const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
                        if (!reason || reason.trim() === '') {
                          alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
                          return;
                        }
                        if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
                          deleteMutation.mutate({ prod: p, reason });
                        }
                      });
                    }}`;

code = code.replace(/onClick=\{\(\) => \{ if \(confirm\('تأكيد الحذف؟'\)\) deleteMutation\.mutate\(p\); \}\}/g, newHandler2);

fs.writeFileSync('src/pages/Products/index.tsx', code);
