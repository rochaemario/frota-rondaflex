# junta prints antes (esq) e depois (dir) com legenda: python3 pair.py saida.png titulo antes1 depois1 [antes2 depois2 ...]
import sys
from PIL import Image,ImageDraw,ImageFont
out,tit=sys.argv[1],sys.argv[2];fs=sys.argv[3:]
try:F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except:F=ImageFont.load_default()
pairs=[(Image.open(fs[i]).convert('RGB'),Image.open(fs[i+1]).convert('RGB')) for i in range(0,len(fs),2)]
W=max(a.width for a,b in pairs)+max(b.width for a,b in pairs)+30;H=60+sum(max(a.height,b.height)+20 for a,b in pairs)
o=Image.new('RGB',(W,H),'#d9dee8');d=ImageDraw.Draw(o);d.text((10,14),tit,fill='#0b1f5c',font=F)
wa=max(a.width for a,b in pairs);d.text((wa-80,14),'ANTES',fill='#b00020',font=F);d.text((W-140,14),'DEPOIS',fill='#0a7a2f',font=F)
y=60
for a,b in pairs:o.paste(a,(10,y));o.paste(b,(wa+20,y));y+=max(a.height,b.height)+20
o.save(out)
