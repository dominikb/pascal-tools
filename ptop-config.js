module.exports = `
end=crbefore,dindonkey,dindent,upper
[end]=if,then,else,while,with,for,record,try,finally,except,class,object,private,public,protected,published,casevar,colon,equals
begin=crbefore,dindonkey,inbytab,crafter,upper
[begin]=var,label,const,type
if=spaft,gobsym,inbytab,upper
then=upper
else=crbefore,dindonkey,inbytab,upper
[else]=if,then,else
proc=dindonkey,spaft,upper
[proc]=var,label,const,type
var=dindonkey,spaft,inbytab,upper
[var]=var,label,const,type
of=crsupp,spbef,spaft,upper
while=spaft,gobsym,inbytab,crafter,upper
do=crsupp,spbef,upper
case=spaft,gobsym,inbytab,crafter,upper
with=spaft,gobsym,inbytab,crafter,upper
for=spaft,gobsym,inbytab,crafter,upper
repeat=inbytab,crafter,upper
until=crbefore,dindonkey,dindent,spaft,gobsym,crafter,upper
[until]=if,then,else,while,with,for,colon,equals
func=dindonkey,spaft,upper
[func]=var,label,const,type
label=spaft,inbytab,upper
const=dindonkey,spaft,inbytab,upper
[const]=var,label,const,type
type=dindonkey,spaft,inbytab,upper
[type]=var,label,const,type
record=inbyindent,crafter,upper
[record]=end
string=upper
prog=spaft,upper
asm=
try=crbefore,inbytab,crafter,upper
finally=crbefore,dindent,inbytab,crafter,upper
[finally]=try
except=crbefore,dindent,inbytab,crafter,upper
[except]=try
raise=
class=inbyindent,upper
object=inbyindent,upper
constructor=
destructor=
inherited=
property=
private=crbefore,dindonkey,spaft,inbytab,upper
[private]=end,private,public,protected,published
public=crbefore,dindonkey,spaft,inbytab,upper
[public]=end,private,public,protected,published
protected=crbefore,dindonkey,spaft,inbytab,upper
[protected]=end,private,public,protected,published
published=crbefore,dindonkey,spaft,inbytab,upper
[published]=end,private,public,protected,published
initialization=
finalization=
inline=
library=spaft,upper
interface=crafter,upper
implementation=dindonkey,crafter,upper
[implementation]=end,var,label,const,type,property
read=
write=
unit=spaft,upper
and=
arr=
div=
down=
file=
goto=
in=
mod=
not=
nil=
or=
set=
to=
virtual=
uses=spaft,upper
casevar=spaft,gobsym,inbytab,crafter,upper
ofobject=
becomes=spbef,spaft,gobsym,upper
delphicomment=inbytab
dopencomment=inbytab,spbef
dclosecomment=
opencomment=upper,dindent
closecomment=upper
semicolon=crsupp,dindonkey,crafter,upper
[semicolon]=if,then,else,while,with,for,colon,equals
colon=inbytab,upper
equals=spbef,spaft,inbytab,upper
openparen=gobsym,upper
closeparen=
period=crsupp,upper
endoffile=
other=
`;