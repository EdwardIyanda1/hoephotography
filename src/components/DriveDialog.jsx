import { useEffect,useRef,useId } from 'react';
import Icon from './DriveIcon';
export default function DriveDialog({title,children,onClose,wide=false}){
 const ref=useRef(null),label=useId();
 useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close()},[]);
 return <dialog ref={ref} className={`drive-dialog ${wide?'wide':''}`} aria-labelledby={label} onCancel={e=>{e.preventDefault();onClose()}}><header><h2 id={label}>{title}</h2><button type="button" className="d-icon" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></header>{children}</dialog>
}
