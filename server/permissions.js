const grants = {
 administrator:['files','download','price','edit','upload','caption','delete','feature','approve','staff','audit','invite','ready'],
 manager:['files','download','price','edit','upload','caption','delete','feature','approve','audit','invite','ready'],
 editor:['files','download','upload','caption'],
 owner:['files','download','price','recipients','consent'],
 recipient:['files','download'],
};
export function permissions(role,approval){return Object.fromEntries([...new Set(Object.values(grants).flat())].map(key=>[key,approval==='approved'&&(grants[role]||[]).includes(key)]));}
export function accessFor(user,member){const role=user.administrator?'administrator':member?.role;const approval=user.administrator?'approved':member?.approval;return {role,approval,permissions:permissions(role,approval)};}
