// Original explanatory SVGs, separate from the papers' experimental figures.
export function abcdVisual(id,{svg,text,box,line,arrow}) {
  const heading=label=>text(24,28,label,'sv-label','start');
  const foot=label=>text(220,245,label,'sv-small');
  const stack=(labels)=>labels.map((label,i)=>box(100,44+i*48,240,36,label,i%2===1)+(i<labels.length-1?arrow(220,81+i*48,220,89+i*48):'')).join('');
  switch(id) {
    case 'abcd-overview': return svg('ABCD connects hardware hierarchy, executable mapping, and evaluated design costs.',heading('FROM AN IDEA TO A WORKING SYSTEM')+
      box(29,66,170,55,'Hardware hierarchy',true)+box(241,66,170,55,'Workload mapping',true)+arrow(202,94,236,94)+
      arrow(325,124,325,160)+box(111,166,300,47,'Correctness + physical costs',true)+line(111,189,50,189,true)+line(50,189,50,124,true)+foot('Represent → execute → measure → revise'));
    case 'mahl':return svg('One reusable PE definition is instantiated four times in an array.',heading('ONE DEFINITION. FOUR INSTANCES.')+
      box(27,104,143,56,'Tested PE',true)+arrow(174,132,220,132)+box(231,50,182,168,'')+
      [0,1,2,3].map(i=>box(244+i%2*80,65+Math.floor(i/2)*74,68,58,'PE '+i,true)).join('')+foot('Reuse the design; each instance still uses hardware.'));
    case 'maco':return svg('Hardware choices and software mappings must agree before tool evaluation.',heading('SEARCH BOTH SIDES OF THE MATCH')+
      box(25,52,171,65,'ADD · MUL',true)+box(244,52,171,65,'Loop mapping',true)+arrow(200,83,239,83)+
      arrow(328,120,328,163)+box(111,168,304,45,'Map → evaluate → feedback')+line(111,190,60,190,true)+line(60,190,60,121,true)+foot('A cheap design must still support the workload.'));
    case 'hsco-bench':return svg('Application, driver, accelerator, and system integration all participate in a successful run.',heading('FOLLOW THE COMPLETE EXECUTION PATH')+
      stack(['Application','Software driver','Accelerator interface','SoC + FPGA'])+foot('Passing one block is not the whole-system test.'));
    case 'veriopt':return svg('Two correct circuits have different area and delay. The chosen objective decides which is useful.',heading('SAME BEHAVIOR. DIFFERENT COSTS.')+
      text(245,61,'Area','sv-small')+text(362,61,'Delay','sv-small')+
      box(25,78,125,48,'Circuit A',true)+box(191,78,105,48,'8')+box(310,78,105,48,'2',true)+
      box(25,143,125,48,'Circuit B')+box(191,143,105,48,'4',true)+box(310,143,105,48,'5')+foot('Toy values · choose the objective before ranking.'));
    case 'hierarchical-irs':return svg('A topology view records connections while a behavior view records reset, update, and hold rules.',heading('TWO COMPLEMENTARY VIEWS')+
      box(22,48,188,168,'')+box(230,48,188,168,'')+text(116,74,'Topology','sv-small')+text(324,74,'Behavior','sv-small')+
      box(40,91,152,34,'Input → adder',true)+arrow(116,129,116,146)+box(40,152,152,38,'Sum register',true)+
      text(324,108,'Reset → zero')+text(324,145,'Valid → add')+text(324,181,'Else → hold')+foot('Connections and behavior describe the same circuit.'));
    case 'rome':return svg('A design is decomposed into a decoder, ALU, and registers, so a failing ALU can be repaired locally.',heading('REPAIR THE FAILING LEAF')+
      box(144,47,152,45,'Top module')+[0,1,2].map(i=>arrow(220,96,82+i*138,150)).join('')+
      ['Decoder','ALU · fix','Registers'].map((v,i)=>box(25+i*138,157,114,51,v,i===1)).join('')+foot('Local repair, followed by integration testing.'));
    case 'verigraphi':return svg('The first connection has incompatible widths; the second uses matching eight-bit ports.',heading('MAKE INTERFACE AGREEMENTS EXPLICIT')+
      box(25,65,140,45,'Sender · 8')+arrow(170,88,269,88)+box(274,65,141,45,'Receiver · 16')+text(220,132,'Width mismatch','sv-small')+
      box(25,164,140,45,'Sender · 8',true)+arrow(170,187,269,187)+box(274,164,141,45,'Receiver · 8',true)+foot('Equal width is one structural check, not a proof.'));
    case 'rtlrewriter':return svg('Two adders before selection can sometimes be rewritten as input selection followed by a shared adder.',heading('MOVE THE SELECTION. SHARE THE ADDER.')+
      box(25,57,110,42,'a + b')+box(25,117,110,42,'c + d')+arrow(140,78,199,96)+arrow(140,138,199,120)+box(204,78,125,55,'Select')+
      box(25,185,170,41,'Select operands',true)+arrow(200,205,244,205)+box(249,185,166,41,'One adder',true));
    case 'ppa-rtl':return svg('Preference training can rank the same pair differently for power and delay.',heading('THE OBJECTIVE CHANGES THE PREFERENCE')+
      box(25,60,165,61,'A: power 2',true)+box(250,60,165,61,'B: power 5')+text(108,145,'delay 6','sv-small')+text(332,145,'delay 2','sv-small')+
      box(25,178,165,40,'Power → A',true)+box(250,178,165,40,'Delay → B',true)+foot('Toy pair · training uses tool-derived preferences.'));
    case 'chipseek':return svg('Evaluation proceeds through compilation, functional tests, synthesis, and physical-cost rewards.',heading('GATE EXPENSIVE EVALUATION')+
      stack(['Compile','Check function','Synthesize','Score PPA'])+foot('Fail an earlier gate → stop that candidate.'));
    case 'autoppa':return svg('Contrasting implementations are evaluated to learn a conditional rule that can be tried on another design.',heading('KEEP THE RULE, NOT ONLY THE RESULT')+
      box(25,56,163,54,'Code pair')+arrow(192,83,243,83)+box(247,56,168,54,'Evaluate',true)+
      arrow(331,114,331,163)+box(247,168,168,46,'Induce a rule',true)+
      box(25,168,163,46,'Try elsewhere')+line(193,191,241,191)+`<path d="M199 187 L193 191 L199 195" class="sv-line"/>`+foot('Check the condition before reusing a transformation.'));
    case 'spatial':return svg('Four arithmetic lanes can receive four consecutive elements from four independent cyclic memory banks.',heading('FEED THE LANES YOU CREATE')+
      [0,1,2,3].map(i=>box(24+i*102,59,85,45,'Bank '+i)+arrow(66+i*102,108,66+i*102,158)+box(24+i*102,163,85,45,'Lane '+i,true)).join('')+foot('One read per bank · conflict-free toy addresses.'));
    case 'calyx':return svg('The resource description lists an adder while the control description sequences two uses of it.',heading('STRUCTURE + CONTROL')+
      box(25,58,155,143,'')+text(102,86,'Resources','sv-small')+box(43,116,120,51,'One adder',true)+
      box(225,58,190,143,'')+text(320,86,'Control','sv-small')+box(243,102,154,34,'First sum',true)+arrow(320,139,320,154)+box(243,158,154,30,'Second sum',true)+foot('Explicit order exposes opportunities to share.'));
    case 'gemmini':return svg('Application and software execute on a system containing the CPU, shared memory, and accelerator.',heading('ZOOM OUT FROM THE COMPUTE BLOCK')+
      box(25,48,390,180,'')+text(220,72,'Application + software stack','sv-small')+
      box(49,94,342,112,'')+text(220,118,'CPU + shared memory + operating system','sv-small')+
      box(89,142,262,46,'Gemmini accelerator',true));
    case 'timeloop':return svg('One retained weight is reused in four multiply operations, avoiding repeated weight fetches.',heading('SAME WORK. MORE REUSE.')+
      box(150,48,140,44,'Weight W',true)+[0,1,2,3].map(i=>arrow(220,96,67+i*102,159)+box(25+i*102,164,85,48,'× W',true)).join('')+foot('Four multiplications; one initial weight fetch.'));
    case 'accelergy':return svg('Four memory reads costing ten units and four multiplies costing one unit total forty-four energy units.',heading('COUNT ACTIONS × PRICE EACH ACTION')+
      box(25,57,185,61,'4 reads × 10')+box(230,57,185,61,'4 multiplies × 1')+
      arrow(117,122,185,161)+arrow(322,122,255,161)+box(111,169,218,46,'Total = 44',true)+foot('Invented energy units · omitted costs matter.'));
    case 'asap':return svg('Two fractional bits round 0.3 to 0.25; eight fractional bits round it to approximately 0.3008.',heading('PRECISION CHANGES THE ANSWER')+
      text(220,67,'Input x = 0.3')+box(25,97,185,50,'2 fractional bits')+box(230,97,185,50,'8 fractional bits',true)+
      arrow(117,152,117,173)+arrow(322,152,322,173)+text(117,199,'0.25')+text(322,199,'0.30078125')+foot('Quantization error and hardware cost are different tests.'));
    default:return null;
  }
}
