10 input s$
20 if s$ = "exit" then goto 1000
30 goto 9200
40 goto 10
1000 end
9200 rem collecting numbers
9210 f = 0
9220 e = 0
9230 s = 0
9240 for i = 1 to len(s$)
9245 c$ = mid$(s$, i, 1)
9250 l = val(c$)
9270 if l = 0 then goto 9290
9270 if s = 0 then f = l: s = 1
9280 if s = 1 then e = l
9290 next i
9300 sum = sum + f * 10 + e
9320 goto 10
