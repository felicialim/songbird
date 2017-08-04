/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Test AmbisonicEncoder object.
 *
 * Set directions by loading from the pre-computed encoder table. Verify values
 * are loaded correctly by comparing to directly-computed spherical harmonic
 * coefficients.
 */
describe('AmbisonicEncoder', function () {
  // This test is async, override timeout threshold to 5 sec.
  this.timeout(5000);

  var ambisonicOrder = 3;
  var numberOfChannels = Math.pow(ambisonicOrder + 1, 2);
  var sampleRate = 48000;
  var renderLength = 1;
  var threshold = 1e-8;

  var numAngles = 32;
  var vectorMagnitude = 2;
  var angles = [
    [-101,10],[-88,-25],[-69,25],[-128,-6],[-51,-22],[-107,47],[-122,-46],
    [-34,17],[-150,20],[-46,-56],[-51,64],[-161,-29],[-13,-12],[-165,54],
    [-144,-81],[-2,40],[178,2],[8,-45],[106,81],[161,-49],[16,7],[156,32],
    [64,-63],[47,50],[147,-15],[39,-20],[114,44],[108,-41],[55,17],[122,8],
    [76,-21],[76,0]
  ];
  var coefficients = [
    [1,-0.96671406082679656,0.17364817766693036,-0.18791017799129189,
      0.31463640173169238,-0.29075613877030404,-0.45476946558943115,
      -0.056517268137861072,-0.77875242153232016,0.63326544072427193,
      0.12216989451608423,0.5027357746246186,-0.24738193337490114,
      0.097721935286123732,-0.30238109980001571,0.4112473857159098],
    [1,-0.90575568882040425,-0.42261826174069939,0.031629685625136621,
      -0.049621121214302254,0.663009814316559,-0.23209070726490444,
      -0.023152812896515093,-0.70961509376958232,0.58530399999474281,
      0.0468921164388325,0.059331419429483855,0.44522179327790551,
      -0.0020718988215152148,0.67058850726261643,-0.061517929317389392],
    [1,-0.84611121035941084,0.42261826174069939,0.32479166329726283,
      -0.47598465266642892,-0.61935027667575016,-0.23209070726490444,
      0.23774629630505453,-0.52863451211796275,0.26718612902813127,
      -0.44980700173091165,0.05542441491170854,-0.44522179327790551,
      -0.0212754395474855,-0.49956128538014716,-0.5243823037558647],
    [1,-0.7836939482475388,-0.10452846326765347,-0.6122888173461013,
      0.831119454412483,0.14188669938174012,-0.48361070055035421,
      0.11085403881943309,-0.20722135369277841,-0.31629793426537406,
      -0.19425983520126594,0.45369446909178524,0.15393744775897211,
      0.35446496752700796,0.048434416743377062,0.710416791869968],
    [1,-0.72055718810468639,-0.37460659341591207,0.58349570593106648,
      -0.72822694917417174,0.46752463452751986,-0.28950485025398831,
      -0.37859398416571682,-0.15478941643191174,-0.28607793018540284,
      0.60999625102816168,0.13164652640567026,0.4304884384956586,
      -0.10660525510889668,0.12965870575014959,-0.56145955117504043],
    [1,-0.65219827528675822,0.73135370161917046,-0.19939702314958352,
      0.22524696278050835,-0.82616679730679532,0.30231735530809373,
      -0.25258453793912539,-0.33394235529442379,0.15781991443238308,
      0.36835910550491274,-0.66873215889915194,-0.11906760629895971,
      -0.20445193865355879,-0.5461148322178504,0.19489136357715478],
    [1,-0.5891037085468781,-0.71933980033865108,-0.36811285256706894,
      0.37560672988931387,0.73398379926222557,0.27617462252687558,
      0.45864398095693265,-0.18319564265167354,-0.027700550115583072,
      -0.604160680272651,-0.57260136906668979,0.14845420384729235,
      -0.35780104639109594,0.29466885249909214,0.26355312938211628],
    [1,-0.53475883308985384,0.29237170472273666,0.79281257350643652,
      -0.73432636874378709,-0.27080328873055515,-0.37177817941628122,
      0.40148238601680714,0.29668711129478809,-0.67629059774410616,
      -0.48007541455098318,0.1875082331852844,-0.37607683663958053,
      -0.277992387795288,0.19396305785728216,-0.14375000414625108],
    [1,-0.46984631039295421,0.34202014332566871,-0.81379768134937391,
      0.66226666616961671,-0.27833519961320963,-0.32453333233923354,
      -0.48209070726490455,0.38235983798834439,-0.65599036103082842,
      0.50648849311014843,0.11943615378043188,-0.41300832361814849,
      0.20686948660831769,0.29242126783859218,2.0083912397698017E-16],
    [1,-0.40224971153343769,-0.82903757255504162,0.38844803109722448,
      -0.27063832268392046,0.57760451879363051,0.530954945061934,
      -0.55778620007685076,-0.0094508984820783626,-0.092498748690773652,
      0.50170509200958913,-0.60017890799783813,-0.18094428294704099,
      0.57958603432948008,0.017519927870902827,-0.1027302679020136],
    [1,-0.34067836634639237,0.89879404629916693,0.27587590152226787,
      -0.16278671104953776,-0.53035341579531736,0.71174610649424352,
      0.42947172806148082,-0.034601383586261109,-0.030235186938445048,
      -0.32716296682434193,-0.63403444533353448,0.46699257412328726,
      0.51343097032674889,-0.069540635333945555,-0.059339895521304351],
    [1,-0.28474832390523191,-0.48480962024633706,-0.82696917968553318,
      0.40786001220240059,0.23910740870016897,-0.14743944817490362,
      0.69441833727990965,0.52203700972462974,-0.44359759936357446,
      -0.44214768875364147,-0.03055029946507325,0.44233985162923239,
      -0.088724512022719623,-0.56592323441373338,-0.28807564935089319],
    [1,-0.22003533408899148,-0.20791169081775934,0.95307774109652077,
      -0.363229724425878,0.079237718922873249,-0.43515909323195073,
      -0.34321626784773462,0.74473129936616678,-0.46561288970892883,
      0.16886719661602989,0.10562058852421316,0.289398898626136,
      -0.45749303102032329,-0.34622906193857245,0.57498403354762473],
    [1,-0.15213001772368231,0.80901699437494745,-0.5677569555011357,
      0.14960220911365543,-0.21317348628895808,0.48176274578121053,
      -0.79557428165697808,0.25911862710939465,-0.11352227000083778,
      0.27063293868263738,-0.21171057952909864,0.1102457514062631,
      -0.79011463930244674,0.46875,-0.11352227000083752],
    [1,-0.091949871500910135,-0.98768834059513788,-0.12655814072350027,
      0.020155883521547083,0.15730107154560233,0.96329238722136534,
      0.21650635094610954,0.006549043551126915,-0.0028783503736530703,
      -0.044515040126117088,-0.21834054589968482,-0.92726220534090709,
      -0.30051997988213253,-0.014463813315573591,0.00093523272905922893],
    [1,-0.026734565516599973,0.64278760968653925,0.76557778954205835,
      -0.035450558637989647,-0.029764682518541127,0.11976386674980206,
      0.85234898748651411,0.50696660769588608,-0.037148088709029956,
      -0.050953683157801084,-0.017450058875834697,-0.30022052373282221,
      0.499704305770192,0.72867161738995678,0.3534404547555019],
    [1,0.034878236872062825,0.034899496702500969,-0.99878202512991232,
      -0.060337299409135924,0.0021083092494511586,-0.49817303769486815,
      -0.06037407766599677,0.86286358168135047,0.082486077345859041,
      -0.0047085808726652443,-0.021228400462227785,-0.05224297827884556,
      0.6079018524275146,0.067335843602722725,-0.78480260226768883],
    [1,0.0984102434476223,-0.70710678118654746,0.70022526659967077,
      0.11935447618474586,-0.12052744095487311,0.24999999999999981,
      -0.85759730408675472,0.41623852418374846,0.11368634785719485,
      -0.18871599684006038,0.090395580716154847,0.17677669529663709,
      0.64319797806506607,-0.658130893163862,0.25534371797812638],
    [1,0.15037445916777589,0.98768834059513788,-0.043119182302335995,
      -0.011230658517872598,0.25724955537265148,0.96329238722136534,
      -0.073765122991612739,-0.017972810610020512,-0.0020251081800463778,
      -0.024803339135760424,0.35707327229638453,0.92726220534090709,
      -0.1023891132087866,-0.03969364005447263,0.0022491104886424741],
    [1,0.21359192728339371,-0.75470958022277179,-0.62031599860017561,
      -0.22948718782396157,-0.27920637155895761,0.35437982572004878,
      0.81087418139792244,0.29373020575080111,0.18722341449913132,
      0.38727843011012114,0.2417055547414442,0.057383304300852839,
      -0.70196390127477148,-0.49569378594832175,-0.12158430700010109],
    [1,0.27358279676475233,0.12186934340514749,0.95409659702378924,
      0.45210754948443588,0.057748922253838229,-0.47772179470699733,
      0.20139442558428114,0.7235233222800781,0.57446767516037356,
      0.12320298568423912,-0.15509333227935104,-0.17827896468888246,
      -0.5408747271344263,0.19716599207143809,0.51725301803277812],
    [1,0.344932235797488,0.5299192642332049,-0.77473048610615869,
      -0.46285510369321869,0.31659504872264044,-0.078778360091808067,
      -0.71108412186704784,0.41675660728927044,0.45857226522196837,
      -0.54845344252446226,0.085350941770144448,-0.42285646051771897,
      -0.19170135390310192,0.49382969775809904,-0.14899916111675757],
    [1,0.4080439582422884,-0.8910065241883679,0.19901633600217161,
      0.1406553661284107,-0.629721415839703,0.69083893921935458,
      -0.3071356562228576,-0.10989201584716708,-0.015380101922699419,
      -0.28023488137119779,0.74199422142181815,-0.43189898722078196,
      0.36189476231497431,0.21894348486113185,-0.072357690592379093],
    [1,0.47010509769918918,0.766044443118978,0.43838009567471325,
      0.35694920173121825,0.62374855783792693,0.38023613325019745,
      0.5816549401404767,-0.024960319702845072,0.13213391496302376,
      0.6114280854012647,0.55679344017226373,-0.025233333830383509,
      0.51921828282312354,-0.04275521674483488,-0.16317179586968236],
    [1,0.52608090992617107,-0.25881904510252074,-0.81009356132700594,
      -0.73815633353116217,-0.23583562010782802,-0.39951905283832895,
      0.36315500862353012,0.32864837393024826,0.70370602605869026,
      0.42719836629146313,-0.2142551630886477,0.34488459632814711,
      0.32992401895658785,-0.19020096698990235,0.11145608509031006],
    [1,0.59136772757963463,-0.34202014332566871,0.7302783252546855,
      0.74800871629053123,-0.35032403332703937,-0.32453333233923354,
      -0.43261415262145142,0.15899416083392229,0.584491691483151,
      -0.57206232307971294,-0.15032721400517984,0.41300832361814849,
      -0.18563864912483272,-0.12159560045478905,-0.29781339182871147],
    [1,0.65714960710091042,0.69465837045899725,-0.29258185562055933,
      -0.33302149791283164,0.79067162444944994,0.22382537747312414,
      -0.35202968786439309,-0.29985390355883851,-0.090933654023872171,
      -0.51728340416243868,0.56851979296186028,-0.20396862700124763,
      -0.25312131999229015,-0.46576406915601415,0.27986500996446145],
    [1,0.71777146418124749,-0.65605902899050728,-0.23321808610641925,
      -0.28994060637247665,-0.81562350440886433,0.14562017427995089,
      0.26501214129294665,-0.39906900862152606,-0.19975528698472864,
      0.4253407199505943,0.50638362392493041,0.27814696909444986,
      -0.16453401326300662,0.58543127698019071,0.27493956552431109],
    [1,0.783358995810406,0.29237170472273666,0.54851387399083473,
      0.74423326782309,0.3966950692453145,-0.37177817941628122,
      0.277768877856192,-0.27087875683827134,0.17894731489258867,
      0.48655217867773959,-0.27467757831225387,-0.37607683663958053,
      -0.19233131091142805,-0.17709051045606802,-0.66784047105716815],
    [1,0.83979495038078966,0.13917310096006544,-0.5247621263811697,
      -0.76330194580934763,0.20243667259244241,-0.47094627195373917,
      -0.12649647240552017,-0.37228723388695234,0.080247756678776108,
      -0.23753995816781634,-0.46446267366834082,-0.20202048906235065,
      0.29022848988120947,-0.1158559786850156,0.76350640367565437],
    [1,0.905849097965157,-0.35836794954530027,0.22585354647294928,
      0.35435894337057477,-0.56227094912570652,-0.30735861910804557,
      -0.14018989280225203,-0.66645224302920236,-0.47804488962942526,
      -0.28396025795410784,-0.19851217700407492,0.42249109653824241,
      -0.04949464463247797,0.534051572240862,-0.4304335519782489],
    [1,0.97029572627599669,0,0.24192189559966773,0.40657429972696241,0,
      -0.49999999999999989,0,-0.76465504562615039,-0.58750756996922338,0,
      -0.5941823572448518,-0,-0.1481463004565122,-0,-0.52899419205588472]
  ];
  var context;
  var encoder;
  var source;

  beforeEach(function () {
    // Create nodes.
    context =
      new OfflineAudioContext(numberOfChannels, renderLength, sampleRate);
    encoder = Songbird.createAmbisonicEncoder(context, ambisonicOrder);
    source = context.createBufferSource();
    source.buffer = context.createBuffer(1, renderLength, sampleRate);
    source.buffer.getChannelData(0)[0] = 1;

    // Connect audio graph.
    source.connect(encoder.input);
    encoder.output.connect(context.destination);
    source.start();
  });

  for (let index = 0; index < numAngles; index++) {
    it('#setDirection: verify direction [' + index + '].',
      function(done) {
        encoder.setDirection(angles[index][0], angles[index][1]);
        expectedValues = coefficients[index];
        context.startRendering().then(function (renderedBuffer) {
          let error = 0;
          for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
            let buffer = renderedBuffer.getChannelData(i);
            for (let j = 0; j < buffer.length; j++) {
              error += Math.abs(buffer[j] - expectedValues[i]);
            }
          }
          error /= renderedBuffer.getChannelData(0).length *
            renderedBuffer.numberOfChannels * vectorMagnitude;
          expect(error).to.be.below(threshold);
          done();
        });
      }
    );
  }
});