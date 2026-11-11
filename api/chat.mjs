import {randomUUID} from 'node:crypto';
import {put} from '@vercel/blob';
import {GET as originalGET,POST as originalPOST} from '../server/chat-core.mjs';
const getSessionId=(b)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(b?.sessionId||''))?b.sessionId:randomUUID();
async function archive(body,response){
 if(!Array.isArray(body?.messages))return;
 const last=[...body.messages].reverse().find(m=>m?.role==='user'&&typeof m.content==='string'&&m.content.trim());
 if(!last)return;
 const result=await response.clone().json().catch(()=>({}));
 const now=new Date().toISOString();
 const sid=getSessionId(body);
 const event={version:1,eventId:randomUUID(),sessionId:sid,recordedAt:now,user:last.content.slice(0,700),assistant:typeof result?.reply==='string'?result.reply.slice(0,3500):null,responseStatus:response.status,error:response.ok?null:String(result?.error||'A solicitação não foi concluída.').slice(0,200),messageCount:Math.min(body.messages.length,14)};
 const [year,month,day]=now.slice(0,10).split('-');
 const name=[year,month,day,sid,now.replace(/[:.]/g,'-')+'-'+event.eventId+'.json'].join('/');
 const bytes=JSON.stringify(event);
 const opts={access:'private',contentType:'application/json',allowOverwrite:false,addRandomSuffix:false};
 await put('conversations/'+name,bytes,opts);
 await put('backup/'+name,bytes,opts);
}
export async function GET(request){return originalGET(request)}
export async function POST(request){
 const body=await request.clone().json().catch(()=>null);
 let response;
 try{response=await originalPOST(request)}
 catch(e){console.error('Aureum AI request failed:',e?.message||'unknown');response=Response.json({error:'O assistente está temporariamente indisponível.'},{status:502})}
 try{await archive(body,response)}
 catch(error){console.error('Aureum private chat archival error:',error?.message||'unknown');return Response.json({error:'Não foi possível registrar a conversa com segurança. Tente novamente em instantes.'},{status:503,headers:{'Cache-Control':'no-store'}})}
 const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
