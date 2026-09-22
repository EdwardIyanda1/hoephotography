const paths={
 folder:'M3 6h6l2 2h10v12H3z',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',list:'M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1',
 image:'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M8 7h.1',video:'M3 5h13v14H3zM16 10l5-3v10l-5-3',
 users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8M17 4a4 4 0 0 1 0 7M22 21v-2a4 4 0 0 0-3-4',
 lock:'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4M12 14v3',upload:'M12 16V3M7 8l5-5 5 5M4 16v5h16v-5',download:'M12 3v13M7 11l5 5 5-5M4 16v5h16v-5',
 close:'M6 6l12 12M18 6L6 18',chevron:'M9 5l7 7-7 7',back:'M15 5l-7 7 7 7',info:'M12 11v6M12 7h.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 check:'M5 12l4 4L19 6',plus:'M12 4v16M4 12h16',link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',
 trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',edit:'M4 16L16 4l4 4L8 20H4zM13 7l4 4',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
};
export default function DriveIcon({name,size=20,...props}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]||paths.folder}/></svg>}
