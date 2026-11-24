/* ===== Data structures ===== */
class Node{constructor(d){this.d=d;this.next=null}}
class LinkedList{constructor(){this.head=null;this.size=0}
 addFirst(d){const n=new Node(d);n.next=this.head;this.head=n;this.size++}
 toArray(){const a=[];for(let c=this.head;c;c=c.next)a.push(c.d);return a}
 static from(a){const l=new LinkedList();for(let i=a.length-1;i>=0;i--)l.addFirst(a[i]);return l}}
class Stack{constructor(){this.a=[]}push(x){this.a.push(x)}pop(){return this.a.pop()}peek(){return this.a[this.a.length-1]}}
class Queue{constructor(a=[]){this.a=a}enqueue(x){this.a.push(x)}dequeue(){return this.a.shift()}}
/* ===== Storage ===== */
const KEY='bms_v1',$=s=>document.querySelector(s);let accounts,txns,undo,queue;
const inr=p=>'₹'+(p/100).toLocaleString('en-IN',{minimumFractionDigits:2});
const toP=v=>{const n=Math.round(parseFloat(v)*100);return n>0?n:NaN};
const fd=t=>new Date(t).toLocaleString('en-IN');
function seed(){const n=['Aarav Sharma','Priya Singh','Rohit Verma','Neha Gupta','Imran Khan'],now=Date.now();
 accounts=n.map((c,i)=>({no:'ACC100000'+(i+1),name:c,email:c.split(' ')[0].toLowerCase()+'@mail.com',mobile:'98765432'+(10+i),addr:'Lucknow, UP',type:i%2?'Current':'Savings',bal:(50000+i*25000)*100,created:now-864e5*(30-i)}));
 txns=new LinkedList();accounts.forEach((a,i)=>txns.addFirst({id:'TXN-S'+i,ts:a.created,acc:a.no,type:'Deposit',amt:a.bal,status:'Success'}));
 queue=new Queue(['Cheque book request – ACC1000001','KYC update – ACC1000003']);save()}
function save(){localStorage.setItem(KEY,JSON.stringify({a:accounts,t:txns.toArray().reverse(),q:queue.a}))}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(!s)throw 0;accounts=s.a;txns=LinkedList.from(s.t.reverse());queue=new Queue(s.q)}catch{seed()}
 undo=new Stack();txns.toArray().reverse().filter(t=>t.type!='Transfer'&&t.status=='Success'&&!t.id.startsWith('TXN-S')).forEach(t=>undo.push(t.id))}
/* ===== Banking logic ===== */
const find=n=>accounts.find(a=>a.no===(n||'').trim().toUpperCase());
const rec=(type,acc,amt,to)=>{const t={id:'TXN'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*99),ts:Date.now(),acc,to,type,amt,status:'Success'};txns.addFirst(t);if(type!='Transfer')undo.push(t.id);return t};
function newNo(){let n;do{n='ACC'+(1e9+Math.floor(Math.random()*9e9))}while(find(n));return n}
function money(kind){const a=find($('#an').value),amt=toP($('#am').value);
 if(!a)return toast('Account not found','e');if(isNaN(amt))return toast('Enter an amount greater than zero','e');
 if(kind=='Withdrawal'&&amt>a.bal)return toast('Insufficient balance. Available: '+inr(a.bal),'e');
 a.bal+=kind=='Deposit'?amt:-amt;const t=rec(kind,a.no,amt);save();toast(`${kind} of ${inr(amt)} successful · ${t.id}`);show(kind=='Deposit'?'deposit':'withdraw')}
function transfer(){const f=find($('#fa').value),r=find($('#ta').value),amt=toP($('#am').value);
 if(!f||!r)return toast('Both accounts must exist','e');if(f===r)return toast('Cannot transfer to the same account','e');
 if(isNaN(amt))return toast('Enter a valid amount','e');if(amt>f.bal)return toast('Insufficient balance','e');
 f.bal-=amt;r.bal+=amt;const t=rec('Transfer',f.no,amt,r.no);save();toast(`Transferred ${inr(amt)} · ${t.id}`);show('transfer')}
function undoLast(){const id=undo.pop();if(!id)return toast('Nothing to undo','e');const t=txns.toArray().find(x=>x.id==id),a=find(t.acc);
 if(t.type=='Deposit'&&a.bal<t.amt){undo.push(id);return toast('Cannot undo: balance too low','e')}
 a.bal+=t.type=='Deposit'?-t.amt:t.amt;t.status='Reversed';save();toast('Reversed '+id);show('ds')}
function saveAcc(edit){const v=k=>$('#'+k).value.trim(),e=[];
 if(!/^[A-Za-z. ]{2,}$/.test(v('n')))e.push('Valid name required');if(!/^\S+@\S+\.\S+$/.test(v('e')))e.push('Valid email required');
 if(!/^[6-9]\d{9}$/.test(v('m')))e.push('10-digit mobile starting 6-9');if(v('ad').length<3)e.push('Address required');
 const dep=edit?0:($('#d').value==''?0:toP($('#d').value));if(!edit&&isNaN(dep))e.push('Initial deposit must be positive');
 if(e.length)return toast(e[0],'e');
 if(edit){Object.assign(find(edit),{name:v('n'),email:v('e'),mobile:v('m'),addr:v('ad'),type:$('#t').value})}
 else{const a={no:newNo(),name:v('n'),email:v('e'),mobile:v('m'),addr:v('ad'),type:$('#t').value,bal:dep,created:Date.now()};accounts.push(a);if(dep)rec('Deposit',a.no,dep)}
 save();toast(edit?'Account updated':'Account created');show('accounts')}
function delAcc(n){if(confirm('Delete account '+n+'? This cannot be undone.')){accounts.splice(accounts.indexOf(find(n)),1);save();toast('Account deleted');show('accounts')}}
function csv(){const r=[['ID','Date','Account','To','Type','Amount','Status'],...txns.toArray().map(t=>[t.id,fd(t.ts),t.acc,t.to||'',t.type,t.amt/100,t.status])];
 const b=new Blob([r.map(x=>x.join(',').replace(/\n/g,' ')).join('\n')],{type:'text/csv'}),l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='transactions.csv';l.click()}
/* ===== UI ===== */
const toast=(m,c='')=>{const d=document.createElement('div');d.className=c;d.textContent=m;$('#toast').append(d);setTimeout(()=>d.remove(),3500)};
const pages=[['dashboard','Dashboard'],['accounts','Account Management'],['deposit','Deposit Money'],['withdraw','Withdraw Money'],['transfer','Fund Transfer'],['balance','Balance Enquiry'],['history','Transaction History'],['ds','Data Structures'],['settings','Settings'],['about','About Project']];
const rows=(l,n)=>l.slice(0,n).map(t=>`<tr><td>${t.id}</td><td>${fd(t.ts)}</td><td>${t.acc}${t.to?' → '+t.to:''}</td><td>${t.type}</td><td>${inr(t.amt)}</td><td>${t.status}</td></tr>`).join('')||'<tr><td colspan=6>No transactions yet.</td></tr>';
const thead='<thead><tr><th>ID</th><th>Date</th><th>Account</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>';
const sum=ty=>txns.toArray().filter(t=>t.type==ty&&t.status=='Success').reduce((s,t)=>s+t.amt,0);
function lookup(id,out){const a=find($(id).value);$(out).innerHTML=a?`<b>${a.name}</b> · ${a.type} · Balance <b>${inr(a.bal)}</b>`:'<span class="mut">Enter a valid account number</span>'}
function chart(){const d=[['Deposits',sum('Deposit')],['Withdrawals',sum('Withdrawal')],['Transfers',sum('Transfer')]],m=Math.max(...d.map(x=>x[1]),1);
 return `<svg class="chart" viewBox="0 0 300 170">${d.map((x,i)=>{const h=x[1]/m*110;return `<rect x="${30+i*90}" y="${130-h}" width="50" height="${h}" rx="5" fill="#2f6fed" opacity="${1-i*.25}"/><text x="${55+i*90}" y="150" text-anchor="middle" font-size="11">${x[0]}</text><text x="${55+i*90}" y="${124-h}" text-anchor="middle" font-size="10">${inr(x[1]).split('.')[0]}</text>`}).join('')}</svg>`}
const moneyForm=(k)=>`<div class="card" style="max-width:520px"><h2>${k} Money</h2><label>Account number<input id="an" oninput="lookup('#an','#inf')"></label><div class="info" id="inf"><span class="mut">Enter a valid account number</span></div><label>Amount (₹)<input id="am" type="number" min="0.01" step="0.01"></label><button class="btn" onclick="confirm('Confirm ${k.toLowerCase()}?')&&money('${k=='Withdraw'?'Withdrawal':'Deposit'}')">Confirm ${k}</button></div>`;
const V={
dashboard:()=>{const A=accounts.reduce((s,a)=>s+a.bal,0);return `<h2>Dashboard</h2><div class="grid">${[['Accounts',accounts.length],['Total balance',inr(A)],['Deposits',inr(sum('Deposit'))],['Withdrawals',inr(sum('Withdrawal'))],['Transactions',txns.size]].map(x=>`<div class="card"><div class="mut">${x[0]}</div><div class="big">${x[1]}</div></div>`).join('')}</div>
<div class="bar"><button class="btn" onclick="show('deposit')">Deposit</button><button class="btn alt" onclick="show('withdraw')">Withdraw</button><button class="btn alt" onclick="show('transfer')">Transfer</button><button class="btn alt" onclick="show('accounts')">New account</button></div>
<div class="g2"><div class="card"><h3>Money flow</h3>${chart()}</div><div class="card"><h3>Recent activity</h3><div class="tw"><table>${thead}<tbody>${rows(txns.toArray(),5)}</tbody></table></div></div></div>`},
accounts:()=>`<h2>Account Management</h2><div class="card"><h3 id="ft">Create account</h3><div class="g2"><label>Name<input id="n"></label><label>Email<input id="e"></label><label>Mobile<input id="m"></label><label>Address<input id="ad"></label><label>Type<select id="t"><option>Savings</option><option>Current</option></select></label><label id="dl">Initial deposit (₹)<input id="d" type="number" min="0" step="0.01"></label></div><button class="btn" id="sb" onclick="saveAcc()">Create account</button></div>
<div class="card"><div class="bar"><input id="q" placeholder="Search name, number, mobile" oninput="accTable()"></div><div class="tw"><table><thead><tr><th>Number</th><th>Name</th><th>Type</th><th>Balance</th><th></th></tr></thead><tbody id="at"></tbody></table></div></div>`,
deposit:()=>moneyForm('Deposit'),withdraw:()=>moneyForm('Withdraw'),
transfer:()=>`<div class="card" style="max-width:520px"><h2>Fund Transfer</h2><label>Sender account<input id="fa" oninput="lookup('#fa','#i1')"></label><div class="info" id="i1"></div><label>Receiver account<input id="ta" oninput="lookup('#ta','#i2')"></label><div class="info" id="i2"></div><label>Amount (₹)<input id="am" type="number" min="0.01" step="0.01"></label><button class="btn" onclick="confirm('Confirm transfer?')&&transfer()">Transfer</button></div>`,
balance:()=>`<div class="card" style="max-width:620px"><h2>Balance Enquiry</h2><div class="bar"><input id="an" placeholder="Account number"><button class="btn" onclick="enq()">Check</button></div><div id="out"></div></div>`,
history:()=>`<h2>Transaction History</h2><div class="card"><div class="bar"><input id="q" placeholder="Search" oninput="hTable()"><select id="f" onchange="hTable()"><option value="">All</option><option>Deposit</option><option>Withdrawal</option><option>Transfer</option></select><select id="s" onchange="hTable()"><option value="dn">Newest</option><option value="do">Oldest</option><option value="ah">Amount high</option><option value="al">Amount low</option></select><button class="btn alt" onclick="csv()">Download CSV</button></div><div class="tw"><table>${thead}<tbody id="ht"></tbody></table></div></div>`,
ds:()=>{const L=txns.toArray();return `<h2>Data Structures</h2><p class="mut">Educational frontend implementations. The app's real logic uses these; localStorage stores them as JSON.</p><div class="g2">
<div class="card"><h3>Array · accounts</h3><p>Holds every account; lookup by index/scan. Used for listing and search.</p>${accounts.map((a,i)=>`<span class="box">[${i}] ${a.no.slice(-4)}</span>`).join('')}<p class="mut">Access O(1) · search O(n) · insert end O(1) · delete O(n)</p></div>
<div class="card"><h3>Linked list · transactions</h3><p>Each transaction is a node; new ones are added at the head.</p>${L.slice(0,6).map(t=>`<span class="box">${t.id.slice(0,9)}</span><span class="arrow">→</span>`).join('')}<span class="box">…null</span><p class="mut">Insert at head O(1) · traverse/search O(n)</p></div>
<div class="card"><h3>Stack · undo</h3><p>Last deposit/withdrawal is on top; undo pops it and reverses the balance.</p>${undo.a.slice(-5).reverse().map((x,i)=>`<div class="box">${i?'':'TOP '}${x}</div><br>`).join('')||'<span class="mut">Stack empty</span>'}<button class="btn sm" onclick="undoLast()">Undo last (pop)</button><p class="mut">Push/pop/peek O(1)</p></div>
<div class="card"><h3>Queue · service requests</h3><p>First come, first served (FIFO).</p>${queue.a.map((x,i)=>`<span class="box">${i?'':'FRONT '}${x}</span>`).join('')||'<span class="mut">Queue empty</span>'}<div class="bar" style="margin-top:8px"><input id="rq" placeholder="New request"><button class="btn sm" onclick="$('#rq').value.trim()&&(queue.enqueue($('#rq').value.trim()),save(),show('ds'))">Enqueue</button><button class="btn sm alt" onclick="queue.dequeue(),save(),show('ds')">Dequeue</button></div><p class="mut">Enqueue/dequeue O(1) with linked implementation (array shift is O(n) here)</p></div></div>`},
settings:()=>`<div class="card"><h2>Settings</h2><p><b>Bank:</b> Demo National Bank, Lucknow · Admin: admin</p><p class="mut">Demo accounts ACC1000001–ACC1000005 are loaded on first run.</p><button class="btn red" onclick="confirm('Reset all data to the demo set?')&&(localStorage.removeItem(KEY),load(),toast('Demo data restored'),show('settings'))">Reset demo data</button> <button class="btn alt" onclick="logout()">Logout</button></div>`,
about:()=>`<div class="card"><h2>About Project</h2><p><b>Bank Management System</b> · Data Structures PBL, B.Tech.</p><p>Stack: HTML5, CSS3, vanilla JavaScript, localStorage. Money is stored in paise (integers).</p><p>Objectives: apply arrays, linked lists, stacks and queues to a working banking workflow.</p></div>`};
function accTable(){const q=$('#q').value.toLowerCase();$('#at').innerHTML=accounts.filter(a=>(a.name+a.no+a.mobile).toLowerCase().includes(q)).map(a=>`<tr><td>${a.no}</td><td>${a.name}</td><td>${a.type}</td><td>${inr(a.bal)}</td><td><button class="btn sm alt" onclick="viewAcc('${a.no}')">View</button> <button class="btn sm alt" onclick="editAcc('${a.no}')">Edit</button> <button class="btn sm red" onclick="delAcc('${a.no}')">Delete</button></td></tr>`).join('')||'<tr><td colspan=5>No matching accounts.</td></tr>'}
function viewAcc(n){const a=find(n);alert(`${a.name}\n${a.no} · ${a.type}\n${a.email} · ${a.mobile}\n${a.addr}\nBalance: ${inr(a.bal)}\nOpened: ${fd(a.created)}`)}
function editAcc(n){const a=find(n);$('#n').value=a.name;$('#e').value=a.email;$('#m').value=a.mobile;$('#ad').value=a.addr;$('#t').value=a.type;$('#dl').hidden=true;$('#ft').textContent='Edit '+n;$('#sb').textContent='Save changes';$('#sb').onclick=()=>saveAcc(n);scrollTo(0,0)}
function enq(){const a=find($('#an').value);$('#out').innerHTML=a?`<div class="info"><b>${a.name}</b><br>${a.no} · ${a.type}<br>Balance: <b>${inr(a.bal)}</b><br>Opened: ${fd(a.created)}</div><div class="tw"><table>${thead}<tbody>${rows(txns.toArray().filter(t=>t.acc==a.no||t.to==a.no),5)}</tbody></table></div>`:'<p class="err">Account not found.</p>'}
function hTable(){const q=$('#q').value.toLowerCase(),f=$('#f').value,s=$('#s').value;let l=txns.toArray().filter(t=>(!f||t.type==f)&&(t.id+t.acc+(t.to||'')+t.type).toLowerCase().includes(q));
 l.sort((x,y)=>s=='do'?x.ts-y.ts:s=='ah'?y.amt-x.amt:s=='al'?x.amt-y.amt:y.ts-x.ts);$('#ht').innerHTML=rows(l,999)}
function show(p){location.hash=p;$('#nav').innerHTML='<b>Bank MS</b>'+pages.map(x=>`<a class="${x[0]==p?'on':''}" onclick="show('${x[0]}')">${x[1]}</a>`).join('');$('#main').innerHTML=V[p]();if(p=='accounts')accTable();if(p=='history')hTable()}
function logout(){sessionStorage.removeItem('in');$('#app').hidden=true;$('#login').hidden=false}
function enter(){$('#login').hidden=true;$('#app').hidden=false;show(V[location.hash.slice(1)]?location.hash.slice(1):'dashboard')}
$('#lf').onsubmit=e=>{e.preventDefault();if($('#u').value=='admin'&&$('#p').value=='admin123'){sessionStorage.in=1;enter()}else $('#le').textContent='Invalid username or password.'};
load();if(sessionStorage.in)enter();
