import 'dotenv/config';
import pg from 'pg';
let instance;
function connect(){
 if(instance)return instance;
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is missing from .env');
 const url=new URL(process.env.DATABASE_URL);
 instance=new pg.Pool({host:url.hostname,port:Number(url.port||5432),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:decodeURIComponent(url.pathname.slice(1)),ssl:{rejectUnauthorized:true,servername:url.hostname},max:3,connectionTimeoutMillis:30000,idleTimeoutMillis:10000,keepAlive:true});
 instance.on('error',error=>console.error('Idle database connection error:',error.message));return instance;
}
export const pool={query:(...args)=>connect().query(...args),end:()=>instance?.end()};
export const query=(sql,args)=>pool.query(sql,args);
