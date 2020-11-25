class Personagem {
    constructor(scene, posInicial) {
        this.scene = scene;

        //setando atributos inicias
        this.setInitialAttributes(posInicial);

        //construindo estrutura do personagem
        this.criarJuntas();
        this.criarSegmentos();
        this.conectarObjs();
    }

    setInitialAttributes(posInicial) {
        // ângulos e auxiliares
        this.deg2Rad = degreesToRadians;
        this.rad2Deg = radiansToDegrees;
        // set ângulos iniciais das junções
        this.angle = [
            this.deg2Rad(110), this.deg2Rad(0), // braço esquerdo
            this.deg2Rad(0), //cotovelo esquerdo
            this.deg2Rad(140), this.deg2Rad(0), // perna esquerda
            this.deg2Rad(0), // joelho esquerdo
            this.deg2Rad(110), this.deg2Rad(0), // braço direito
            this.deg2Rad(0), // cotovelo direito
            this.deg2Rad(140), this.deg2Rad(0), // perna direita
            this.deg2Rad(0), //joelho direito
        ];

        this.angleInicial = this.angle.slice(); //cópia dos valores originais de angle

        // listas de segmentos e juntas
        this.segmentos = [];
        this.juntas = [];

        // objs para armazenar juntas e segmentos em 3 grupos (centro, esq e dir)
        this.objs = {
            juntas: {
                centro: [],
                dir: [],
                esq: [],
            },
            segmentos: {
                centro: [],
                dir: [],
                esq: [],
            },
        };
        // this.time = 0;

        this.sizeSegmentos = {
            pescoco: 0.9,
            coluna: 1.5,
            ombros: 1.2,
            bracos: 1.8,
            quadril: 1.0,
            femur: 2.4,
            tibia: 2.0,
            getSegByIndex(i) {
                const t = [this.quadril, this.ombros, this.bracos, this.bracos, this.femur, this.tibia];
                return t[i];
            }
        };

        this.sizeJuntas = 0.2;

        this.emRepouso = true;
        this.pauseAnimation = false;
        this.stopAnimation = false;
        this.startAnimation = false;
        this.inverterSentido = true;
        this.limAnguloPerna = {min: this.deg2Rad(-20), max: this.deg2Rad(20)};
        this.thetaQuadril = this.deg2Rad(45); // inclinação do seg. do quadril

        this.speedRad = this.deg2Rad(0.8);
        this.posicao = {
            inicial: new THREE.Vector3(posInicial.x, this.getCenterHeight(this.thetaQuadril), posInicial.z),
            atual: new THREE.Vector3(posInicial.x, this.getCenterHeight(this.thetaQuadril), posInicial.z),
            destino: new THREE.Vector3(posInicial.x, this.getCenterHeight(this.thetaQuadril), posInicial.z),
            copy: function (posFrom, posTo) {
                this[posTo].x = this[posFrom].x;
                // this[posTo].y = this[posFrom].y; // Não mudará posição vertical
                this[posTo].z = this[posFrom].z;
            }
        }

        this.clock = new THREE.Clock();
        this.clock2 = new THREE.Clock();
        this.t = 0;
        this.tRad = 0;
        this.angulo = 0;
    }

    //Métodos para criar o personagem
    createSphere(size, color = 'rgb(66,66,75)') {
        var sphereGeometry = new THREE.SphereGeometry(size, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: "rgb(255,255,255)",
            shininess: "80"
        });
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        this.juntas.push(sphere);
        return sphere;
    }

    createCylinder(height, color = 'rgb(239,210,190)') {
        let cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.15, height, 25);
        let cylinderMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: "rgb(255,255,255)",
            shininess: "80"
        });
        let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.castShadow = true;
        this.segmentos.push(cylinder);
        return cylinder;
    }

    criarJuntas() {
        this.objs.juntas.centro[0] = this.createSphere(0.3);
        this.objs.juntas.centro[1] = this.createSphere(this.sizeJuntas);
        this.objs.juntas.centro[2] = this.createSphere(this.sizeJuntas);
        this.objs.juntas.centro[3] = this.createSphere(0.3, 'rgb(144,76,76)');

        for (let i = 0; i < 6; i++) {
            this.objs.juntas.dir[i] = this.createSphere(this.sizeJuntas);
            this.objs.juntas.esq[i] = this.createSphere(this.sizeJuntas);
        }
    }

    criarSegmentos() {

        this.objs.segmentos.centro[0] = this.createCylinder(this.sizeSegmentos.coluna);
        this.objs.segmentos.centro[1] = this.createCylinder(this.sizeSegmentos.coluna);
        this.objs.segmentos.centro[2] = this.createCylinder(this.sizeSegmentos.pescoco);

        for (let i = 0; i < 6; i++) {
            this.objs.segmentos.esq[i] = this.createCylinder(this.sizeSegmentos.getSegByIndex(i));
            this.objs.segmentos.dir[i] = this.createCylinder(this.sizeSegmentos.getSegByIndex(i));
        }
    }

    conectarObjs() {
        this.scene.add(this.objs.juntas.centro[0]);

        this.objs.juntas.centro[0].add(this.objs.segmentos.centro[0]);
        this.objs.juntas.centro[0].add(this.objs.segmentos.dir[0]);
        this.objs.juntas.centro[0].add(this.objs.segmentos.esq[0]);

        this.objs.segmentos.centro[0].add(this.objs.juntas.centro[1]);
        this.objs.segmentos.dir[0].add(this.objs.juntas.dir[0]);
        this.objs.segmentos.esq[0].add(this.objs.juntas.esq[0]);

        this.objs.juntas.centro[1].add(this.objs.segmentos.centro[1]);
        this.objs.segmentos.centro[1].add(this.objs.juntas.centro[2]);

        //ombros
        this.objs.juntas.centro[2].add(this.objs.segmentos.dir[1]);
        this.objs.juntas.centro[2].add(this.objs.segmentos.esq[1]);
        this.objs.segmentos.dir[1].add(this.objs.juntas.dir[3]);
        this.objs.segmentos.esq[1].add(this.objs.juntas.esq[3]);
        //pescoço
        this.objs.juntas.centro[2].add(this.objs.segmentos.centro[2]);
        this.objs.segmentos.centro[2].add(this.objs.juntas.centro[3]);

        //braço esquerdo
        this.objs.juntas.esq[3].add(this.objs.segmentos.esq[2]);
        this.objs.segmentos.esq[2].add(this.objs.juntas.esq[4]);
        this.objs.juntas.esq[4].add(this.objs.segmentos.esq[3]);
        this.objs.segmentos.esq[3].add(this.objs.juntas.esq[5]);

        //perna esquerda
        this.objs.juntas.esq[0].add(this.objs.segmentos.esq[4]);
        this.objs.segmentos.esq[4].add(this.objs.juntas.esq[1]);
        this.objs.juntas.esq[1].add(this.objs.segmentos.esq[5]);
        this.objs.segmentos.esq[5].add(this.objs.juntas.esq[2]);

        //braço direito
        this.objs.juntas.dir[3].add(this.objs.segmentos.dir[2]);
        this.objs.segmentos.dir[2].add(this.objs.juntas.dir[4]);
        this.objs.juntas.dir[4].add(this.objs.segmentos.dir[3]);
        this.objs.segmentos.dir[3].add(this.objs.juntas.dir[5]);

        //perna esquerda
        this.objs.juntas.dir[0].add(this.objs.segmentos.dir[4]);
        this.objs.segmentos.dir[4].add(this.objs.juntas.dir[1]);
        this.objs.juntas.dir[1].add(this.objs.segmentos.dir[5]);
        this.objs.segmentos.dir[5].add(this.objs.juntas.dir[2]);
    }

    //métodos de update do personagem
    updatePersonagem() {
        this.juntas.forEach(function (s) {
            s.matrixAutoUpdate = false;
            s.matrix.identity(); // resetting matrices
        });
        this.segmentos.forEach(function (c) {
            c.matrixAutoUpdate = false;
            c.matrix.identity(); // resetting matrices
        })

        //easing function
        const easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t
        }
        var interpolation = function (a, b, t, ease) {
            return a + (b - a) * ease(t);
        }
        var interpolationRad = function (a, b, t, ease) {
            return a + (b - a) * ease(t);
        }
        var distance2d = function (delta1, delta2) {
            return Math.sqrt(delta1 * delta1 + delta2 * delta2);
        }

        if (this.emRepouso) {
            // console.log("Em repouso...");
            if (this.startAnimation) {
                this.iniciarAnimacao();

                this.t = 0;
                this.clock = new THREE.Clock();
                this.distanciaPercorrida = 0;

                let deltaX = this.posicao.destino.x - this.posicao.inicial.x;
                let deltaZ = this.posicao.destino.z - this.posicao.inicial.z;
                this.distanciaFinal = distance2d(deltaZ, deltaX);

                let anguloFinal = Math.atan2(deltaX, deltaZ); // personagem vai apontar para local selecionado pelo user

                //suavisar a rotação
                let dtRad = this.clock2.getDelta();
                this.tRad += dtRad * this.speedRad * 10;
                this.angulo = interpolationRad(this.angulo, anguloFinal, this.tRad, easingFunctions.linear);
            }
        } else {

            this.tRad = 0;
            this.clock2 = new THREE.Clock();
            let dt = this.clock.getDelta();

            this.t += dt * this.speedRad * 3;

            let x = interpolation(this.posicao.inicial.x, this.posicao.destino.x, this.t, easingFunctions.linear);
            let z = interpolation(this.posicao.inicial.z, this.posicao.destino.z, this.t, easingFunctions.linear);
            this.distanciaPercorrida += distance2d(x - this.posicao.atual.x, z - this.posicao.atual.z);
            this.posicao.atual.x = x;
            this.posicao.atual.z = z;

            if (this.distanciaPercorrida >= this.distanciaFinal) {
                this.stopAnimation = true;
                this.posicao.copy("atual", "inicial"); //posição inicial passa a ser posição atual
            }

            if (this.stopAnimation) {
                this.pararAnimacao();
            } else {
                this.caminhar();
            }
        }

        this.updateEstruturaCentral();

        this.updateBracoEsquerdo();
        this.updateBracoDireito();

        this.updatePernaEsquerda();
        this.updatePernaDireita();
    }

    updateEstruturaCentral() {
        let mat4 = new THREE.Matrix4();
        let lim = this.deg2Rad(10); //angulo limite de rotação do ombro e do quadril
        let alpha = this.deg2Rad(80); // inclinação do seg. do ombro

        let metadeSegmCol = this.getHalfSize("coluna");
        let metadeSegmPes = this.getHalfSize("pescoco");
        let metadeSegmOmb = this.getHalfSize("ombros");
        let metadeSegmQuad = this.getHalfSize("quadril");

        //movendo verticalmente objs.juntas.centro[0] (obj pai de toda a estrutura)
        this.objs.juntas.centro[0].matrix.multiply(mat4.makeTranslation(this.posicao.atual.x,
            this.posicao.atual.y, this.posicao.atual.z));

        this.objs.juntas.centro[0].matrix.multiply(mat4.makeRotationY(this.angulo));

        // segmento fixo do tronco inferior
        this.objs.segmentos.centro[0].matrix.multiply(mat4.makeRotationZ(0.0));
        this.objs.segmentos.centro[0].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

        this.objs.juntas.centro[1].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

        // segmento fixo do tronco superior
        this.objs.segmentos.centro[1].matrix.multiply(mat4.makeRotationZ(0.0));
        this.objs.segmentos.centro[1].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

        this.objs.juntas.centro[2].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmCol, 0.0));

        // segmento fixo do pescoço
        this.objs.segmentos.centro[2].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmPes, 0.0));

        this.objs.juntas.centro[3].matrix.multiply(mat4.makeTranslation(0.0, metadeSegmPes, 0.0));

        // segmento fixo da perna direita
        this.objs.segmentos.dir[0].matrix.multiply(mat4.makeRotationZ(-this.thetaQuadril));
        this.objs.segmentos.dir[0].matrix.multiply(mat4.makeTranslation(0, -metadeSegmQuad, 0.0));

        this.objs.juntas.dir[0].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmQuad, 0.0));

        // segmento fixo da perna esquerda
        this.objs.segmentos.esq[0].matrix.multiply(mat4.makeRotationZ(this.thetaQuadril));
        this.objs.segmentos.esq[0].matrix.multiply(mat4.makeTranslation(0, -metadeSegmQuad, 0.0));

        this.objs.juntas.esq[0].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmQuad, 0.0));

        // segmento fixo do braço direito
        this.objs.segmentos.dir[1].matrix.multiply(mat4.makeRotationZ(-alpha));
        this.objs.segmentos.dir[1].matrix.multiply(mat4.makeTranslation(0, -metadeSegmOmb, 0.0));

        this.objs.juntas.dir[3].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmOmb, 0.0));

        // segmento fixo do braço esquerdo
        this.objs.segmentos.esq[1].matrix.multiply(mat4.makeRotationZ(alpha));
        this.objs.segmentos.esq[1].matrix.multiply(mat4.makeTranslation(0, -metadeSegmOmb, 0.0));

        this.objs.juntas.esq[3].matrix.multiply(mat4.makeTranslation(0.0, -metadeSegmOmb, 0.0));

        // movendo os ombros conforme o movimento do braço
        let rotOmbro = 0.0;
        let stepOmbro = this.angle[1] / 5;
        if (this.angle[0] !== 0)
            rotOmbro = stepOmbro > lim ? lim : (stepOmbro < -lim ? -lim : stepOmbro);

        this.objs.juntas.centro[2].matrix.multiply(mat4.makeRotationY(-rotOmbro));

        // movendo o quadril conforme o movimento da perna
        let rotQuadril = 0.0;
        let stepQuadril = this.angle[4] / 5;
        if (this.angle[4] !== 0) {
            rotQuadril = stepQuadril > lim ? lim : (stepQuadril < -lim ? -lim : stepQuadril);
        }
        // rotacionando quadril
        this.objs.juntas.centro[0].matrix.multiply(mat4.makeRotationY(-rotQuadril));
        //corrigindo angulo da coluna
        this.objs.juntas.centro[1].matrix.multiply(mat4.makeRotationY(rotQuadril));

        // rotacionando toda a estrutura (para acompanhar o movimento)
        this.objs.juntas.centro[0].matrix.multiply(mat4.makeRotationZ(-rotQuadril / 3));

        //inclinando o tronco conforme a velocidade
        this.objs.juntas.centro[0].matrix.multiply(mat4.makeRotationY(this.speedRad));

    }

    updateBracoEsquerdo() {
        let mat4 = new THREE.Matrix4();
        if (!this.pauseAnimation) {
            this.angle[1] = -this.angle[4] / 2; //espelhando movimento da perna esq

            //movendo o cotovelo com base no movimento do braço
            if (this.angle[1] >= 0)
                this.angle[2] = this.angle[1] * 3;
        }

        let metadeSegmBraco = this.getHalfSize("bracos");
        //movendo e rotação na direção 1
        this.objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationZ(this.angle[0]));
        this.objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

        //rotação na direção 2
        this.objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, -metadeSegmBraco, 0));
        this.objs.segmentos.esq[2].matrix.multiply(mat4.makeRotationX(this.angle[1]));
        this.objs.segmentos.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0));

        // cotovelo
        this.objs.juntas.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

        // segmento movel do antebraço esquerdo
        this.objs.segmentos.esq[3].matrix.multiply(mat4.makeRotationX(this.angle[2]));
        this.objs.segmentos.esq[3].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
        // "mão" esquerda
        this.objs.juntas.esq[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
    }

    updateBracoDireito() {
        let mat4 = new THREE.Matrix4();
        let metadeSegmBraco = this.getHalfSize("bracos");
        this.angle[7] = -this.angle[4] / 2; //espelhando movimento da perna esq

        //rotação do cotovelo
        if (this.angle[7] <= 0)
            this.angle[8] = this.angle[7] * 3;

        // movendo e rotação na direção 1
        this.objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationZ(-this.angle[6]));
        this.objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

        // rotação na direção 2
        this.objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, -metadeSegmBraco, 0));
        this.objs.segmentos.dir[2].matrix.multiply(mat4.makeRotationX(-this.angle[7]));
        this.objs.segmentos.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0));
        // cotovelo
        this.objs.juntas.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));

        // segmento movel do antebraço direito
        this.objs.segmentos.dir[3].matrix.multiply(mat4.makeRotationX(-this.angle[8]));
        this.objs.segmentos.dir[3].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
        // mão direita
        this.objs.juntas.dir[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmBraco, 0.0));
    }

    updatePernaEsquerda() {
        let mat4 = new THREE.Matrix4();
        let metadeSegmFem = this.getHalfSize("femur");
        let metadeSegmTib = this.getHalfSize("tibia");

        //para corrigir pisada
        let peEsqAlt = this.getDistToGround(this.objs.juntas.esq[2]);
        if (peEsqAlt < 1.0) {
            this.objs.juntas.esq[0].matrix.multiply(mat4.makeTranslation(0, (1.0 - peEsqAlt), 0.0));
        }

        this.objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationZ(this.angle[3]));
        this.objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

        this.objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, -metadeSegmFem, 0));
        this.objs.segmentos.esq[4].matrix.multiply(mat4.makeRotationX(this.angle[4]));
        this.objs.segmentos.esq[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

        // joelho
        this.objs.juntas.esq[1].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));
        //
        this.objs.segmentos.esq[5].matrix.multiply(mat4.makeRotationX(-this.angle[5]));
        this.objs.segmentos.esq[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
        // 'pé' esquerdo
        this.objs.juntas.esq[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));

    }

    updatePernaDireita() {
        let mat4 = new THREE.Matrix4();
        let metadeSegmFem = this.getHalfSize("femur");
        let metadeSegmTib = this.getHalfSize("tibia");

        this.angle[10] = -this.angle[4]; //espelhando movimento da perna esq

        // para corrigir pisada
        let peDirAlt = this.getDistToGround(this.objs.juntas.dir[2]);
        if (peDirAlt < 1.0) {
            this.objs.juntas.dir[0].matrix.multiply(mat4.makeTranslation(0, (1.0 - peDirAlt), 0.0));
        }

        this.objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationZ(-this.angle[9]));
        this.objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

        this.objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, -metadeSegmFem, 0));
        this.objs.segmentos.dir[4].matrix.multiply(mat4.makeRotationX(this.angle[10]));
        this.objs.segmentos.dir[4].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));

        // joelho
        this.objs.juntas.dir[1].matrix.multiply(mat4.makeTranslation(0, metadeSegmFem, 0));
        //
        this.objs.segmentos.dir[5].matrix.multiply(mat4.makeRotationX(-this.angle[11]));
        this.objs.segmentos.dir[5].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
        // pé esquerdo
        this.objs.juntas.dir[2].matrix.multiply(mat4.makeTranslation(0, metadeSegmTib, 0.0));
    }

    iniciarAnimacao() {
        // console.log("Iniciando animação...");
        if (this.angle[4] > this.limAnguloPerna.max) {
            this.startAnimation = false;
            this.emRepouso = false;
            this.angle[4] = this.limAnguloPerna.max;
            // console.log("*INICIOU...");
        } else {
            this.angle[4] += this.speedRad / 5;
        }
    }

    pararAnimacao() {
        // console.log("Parando animação...");
        let a = this.deg2Rad(1);
        if (Math.abs(this.angle[4]) <= a) {
            let isJoelhoEsqInclinado = Math.abs(this.angle[5]) >= a;
            let isJoelhoDirInclinado = Math.abs(this.angle[11]) >= a;

            if (isJoelhoEsqInclinado || isJoelhoDirInclinado) {
                if (isJoelhoEsqInclinado)
                    this.angle[5] -= this.speedRad / 2;
                if (isJoelhoDirInclinado)
                    this.angle[11] -= this.speedRad / 2;
            } else {
                this.stopAnimation = false;
                this.emRepouso = true;
                // this.angle[4] = 0.0;
                this.angle[5] = 0.0;
                this.angle[11] = 0.0;
                // console.log("*PAROU...");
            }
        } else {
            this.angle[4] += this.angle[4] > 0 ? -this.speedRad / 5 : this.speedRad / 5;
        }
    }

    caminhar() {
        // console.log("Caminhando...");

        if (this.angle[4] < this.limAnguloPerna.min || this.angle[4] > this.limAnguloPerna.max) {
            this.inverterSentido = !this.inverterSentido;
        }
        this.angle[4] += (this.inverterSentido ? -1 : 1) * this.speedRad;

        //rotacionando os joelhos a partir da rotaçao da perna
        if (!this.inverterSentido) {
            this.angle[5] += -this.angle[4] * this.speedRad * 10;
            this.angle[11] = 0;
        } else {
            this.angle[5] = 0;
            this.angle[11] += this.angle[4] * this.speedRad * 10;
        }
    }

    //Métodos auxiliares
    getHalfSize(attrName) {
        return this.sizeSegmentos[attrName] / 2.0;
    }

    getCenterHeight(angQuadril) {
        let sizeSegmentos = this.sizeSegmentos;
        return (Math.cos(angQuadril) * sizeSegmentos.quadril) + sizeSegmentos.femur + sizeSegmentos.tibia + (this.sizeJuntas * 0.5);
    }

    getDistToGround(obj) {
        return new THREE.Box3().setFromObject(obj).min.y;
    }
}

function main() {
    //path para a textura do chão
    var groundTexture = 'sautumn_grass.png';
    //path para a textura do skybox
    var skyboxTexture = 'autumn_park.jpg';

    var stats = initStats();
    var scene = new THREE.Scene();
    var renderer = initRenderer();

    var camera = initCamera(new THREE.Vector3(20, 5, 20));

    //controle do apontador (mouse)
    var controls = new THREE.PointerLockControls(camera, renderer.domElement);

    const clock = new THREE.Clock();

    // Adicionando luz direcional
    setDirectionalLighting(new THREE.Vector3(100, 100, 80));

    // adicionar plano base
    var groundPlane;
    adicionarPlanoBase();

    //skybox
    createSkybox();

    //criando postes
    for (let i = 1, j = false; i < 5; i++, j = !j) {
        let position = new THREE.Vector3(100 * (j ? -1 : 1), 7.5, 100 * (i > 2 ? -1 : 1));
        criarPoste(position);
        position.y = 50
        setPointLight(position);
        // setSpotLight(position);
    }

    // To use the keyboard
    var keyboard = new KeyboardState();

    // velocidade do usuário
    const speedUser = 20;

    var p = [];
    p[0] = new Personagem(scene, {x: 4, z: 0});
    p[1] = new Personagem(scene, {x: -4, z: 0});
    p[2] = new Personagem(scene, {x: 0, z: 4});
    p[3] = new Personagem(scene, {x: 0, z: -4});
    p[4] = new Personagem(scene, {x: 0, z: 0});

    // Listen window size changes
    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer)
    }, false);

    function adicionarPlanoBase() {
        groundPlane = createGroundPlane(1000, 1000); // width and height
        groundPlane.rotateX(degreesToRadians(-90));

        var textureLoader = new THREE.TextureLoader();
        var grass = textureLoader.load(groundTexture);
        groundPlane.material.map = grass;

        groundPlane.material.map.repeat.set(300, 300);
        groundPlane.material.map.wrapS = THREE.RepeatWrapping;
        groundPlane.material.map.wrapT = THREE.RepeatWrapping;
        // groundPlane.material.map.minFilter = THREE.LinearFilter;
        groundPlane.material.map.magFilter = THREE.LinearFilter;

        scene.add(groundPlane);
    }

    function createSkybox() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            skyboxTexture,
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);
                scene.background = rt;
            });
    }

    function criarPoste(position) {

        var sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        var sphereMaterial = new THREE.MeshPhongMaterial({
            color: 'rgb(200,200,200)',
            wireframe: true,
            specular: "rgb(255,255,255)",
            shininess: "130"
        });
        var lamp = new THREE.Mesh(sphereGeometry, sphereMaterial);
        lamp.castShadow = false;

        let cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 15, 25);
        let cylinderMaterial = new THREE.MeshPhongMaterial({
            color: 'rgb(80,80,80)',
            specular: "rgb(255,255,255)",
            shininess: "130"
        });
        let poste = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        poste.castShadow = false;
        scene.add(poste);

        poste.add(lamp);

        lamp.translateY(7.5 + 1.5);
        poste.position.set(position.x, 7.5, position.z);

    }

    function setSpotLight(position) {
        var spotLight = new THREE.SpotLight("rgb(50, 50, 50)");
        spotLight.position.copy(position);
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.fov = degreesToRadians(90);
        spotLight.castShadow = true;
        spotLight.decay = 2;
        spotLight.penumbra = 0.05;
        spotLight.name = "Spot Light"

        scene.add(spotLight);
    }

    function setPointLight(position) {
        var pointLight = new THREE.PointLight('rgb(255,255,255)', 0.08);
        pointLight.position.copy(position);
        pointLight.name = "Point Light"
        pointLight.castShadow = true;

        scene.add(pointLight);
    }

    //Luz direcional (SOL)
    function setDirectionalLighting(initialPosition) {

        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.copy(initialPosition);
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.castShadow = true;

        dirLight.shadow.camera.left = -200;
        dirLight.shadow.camera.right = 200;
        dirLight.shadow.camera.top = 200;
        dirLight.shadow.camera.bottom = -200;

        scene.add(dirLight);

        var ambientLight = new THREE.AmbientLight(0x343434);
        ambientLight.name = "ambientLight";
        scene.add(ambientLight);
    }

    function keyboardUpdate(delta) {
        keyboard.update();

        //iniciar o movimento quando já houver a posiçao do user
        let iniciarMov = function (indexObj) {
            //posição do usuário quando apertou tecla
            const pos = controls.getObject().position;
            const userPosition = new THREE.Vector3(pos.x, pos.y, pos.z);

            if (p[indexObj].emRepouso) {
                p[indexObj].startAnimation = true;
                p[indexObj].posicao.destino = userPosition;
            }
        };

        if (controls.isLocked) {

            if (keyboard.down("1")) {
                iniciarMov(0);
            }
            if (keyboard.down("2")) {
                iniciarMov(1);
            }
            if (keyboard.down("3")) {
                iniciarMov(2);
            }
            if (keyboard.down("4")) {
                iniciarMov(3);
            }
            if (keyboard.down("5")) {
                iniciarMov(4);
            }

            if (keyboard.pressed("W")) {
                controls.moveForward(speedUser * delta);
            }
            if (keyboard.pressed("S")) {
                controls.moveForward(speedUser * -1 * delta);
            }
            if (keyboard.pressed("D")) {
                controls.moveRight(speedUser * delta);
            }
            if (keyboard.pressed("A")) {
                controls.moveRight(speedUser * -1 * delta);
            }
        }
    }

    pointerLock();

    //trava o mouse na scene.
    function pointerLock() {
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', function () {

            controls.lock();

        }, false);

        controls.addEventListener('lock', function () {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        controls.addEventListener('unlock', function () {
            blocker.style.display = 'block';
            instructions.style.display = '';
        });

        scene.add(controls.getObject());
    }

    render();

    function render() {
        stats.update(); // Update FPS
        // trackballControls.update();

        keyboardUpdate(clock.getDelta());
        p.forEach(pObj => {
            pObj.updatePersonagem();
        });

        // lightFollowingCamera(spotLight, camera);
        requestAnimationFrame(render); // Show events

        renderer.render(scene, camera) // Render scene
    }
}
