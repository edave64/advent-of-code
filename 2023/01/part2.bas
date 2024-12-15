01 sum = 0
10 input s$
20 if s$ = "exit" then goto 50
30 goto 1000
40 goto 10
50 print sum
60 end
1000 rem collecting numbers
1010 f = 0
1020 e = 0
1030 s = 0
1040 for i = 1 to len(s$)
1050 c$ = mid$(s$, i, 1)
1060 l = val(c$)
1070 if l > 0 then goto 1180
1080 if c$ = "o" and "one" = mid$(s$, i, 3) then l = 1: goto 1180
1090 if c$ = "t" and "two" = mid$(s$, i, 3) then l = 2: goto 1180
1100 if c$ = "t" and "three" = mid$(s$, i, 5) then l = 3: goto 1180
1110 if c$ = "f" and "four" = mid$(s$, i, 4) then l = 4: goto 1180
1120 if c$ = "f" and "five" = mid$(s$, i, 4) then l = 5: goto 1180
1130 if c$ = "s" and "six" = mid$(s$, i, 3) then l = 6: goto 1180
1140 if c$ = "s" and "seven" = mid$(s$, i, 5) then l = 7: goto 1180
1150 if c$ = "e" and "eight" = mid$(s$, i, 5) then l = 8: goto 1180
1160 if c$ = "n" and "nine" = mid$(s$, i, 4) then l = 9: goto 1180
1170 if l = 0 then goto 1200
1180 if s = 0 then f = l: s = 1
1190 if s = 1 then e = l
1200 next i
1220 sum = sum + f * 10 + e
1230 goto 10
