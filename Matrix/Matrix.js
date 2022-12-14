import * as Three from '../three.js/three.module.js';
import { OrbitControls } from '../three.js/OrbitControls.js';

class App {
    constructor() {
        // id가 webgl-container인 div요소를 얻어와서, 상수에 저장 
        const divContainer = document.querySelector("#webgl-container");
        // 얻어온 상수를 클래스 필드에 정의
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._divContainer = divContainer;

        // 렌더러 생성, Three.js의 WebGLRenderer 클래스로 생성
        // antialias를 활성화 시키면 렌더링될 때 오브젝트들의 경계선이 계단 현상 없이 부드럽게 표현된다.
        const renderer = new Three.WebGLRenderer({ antialias: true });
        // window의 devicePixelRatio 속성을 얻어와 PixelRatio 설정
        // 디스플레이 설정의 배율값을 얻어온다.
        renderer.setPixelRatio(window.devicePixelRatio);
        // domElement를 자식으로 추가.
        // canvas 타입의 DOM 객체이다.
        // 문서 객체 모델(DOM, Document Object Model)은 XML이나 HTML 문서에 접근하기 위한 일종의 인터페이스.
        divContainer.appendChild(renderer.domElement);
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._renderer = renderer;

        // Scene 객체 생성
        const scene = new Three.Scene();
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._scene = scene;

        // 카메라 객체를 구성
        this._setupCamera();
        // 조명 설정
        this._setupLight();
        // 3D 모델 설정
        this._setupModel();
        // 마우스 컨트롤 설정
        this._setupControls();


        // 창 크기가 변경될 때 발생하는 이벤트인 onresize에 App 클래스의 resize 메서드를 연결한다.
        // this가 가리키는 객체가 이벤트 객체가 아닌 App클래스 객체가 되도록 하기 위해 bind로 설정한다.
        // onresize 이벤트가 필요한 이유는 렌더러와 카메라는 창 크기가 변경될 때마다 그 크기에 맞게 속성값을 재설정해줘야 한다.
        window.onresize = this.resize.bind(this);
        // onresize 이벤트와 상관없이 생성자에서 resize 메서드를 호출한다.
        // 렌더러와 카메라의 속성을 창크기에 맞게 설정해준다. 
        this.resize();

        // render 메서드를 requestAnimationFrame이라는 API에 넘겨줘서 호출해준다.
        // render 메서드 안에서 쓰이는 this가 App 클래스 객체를 가리키도록 하기 위해 bind 사용
        requestAnimationFrame(this.render.bind(this));
    }

    _setupCamera() {
        // 3D 그래픽을 출력할 영역 width, height 얻어오기
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        // 얻어온 크기를 바탕으로 Perspective 카메라 객체 생성
        const camera = new Three.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1500
        );
        camera.position.set(1000, 0, 0);
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._camera = camera;
    }

    _setupLight() {
        // 광원 색상 설정
        const color = 0xffffff;
        // 광원 세기 설정
        const intensity = 1;
        // 위 설정을 바탕으로 Directional 광원 객체 생성
        const light = new Three.DirectionalLight(color, intensity);
        // 광원 위치 설정
        light.position.set(-1, 2, 4);
        // Scene객체에 광원 추가
        this._scene.add(light);

        // AmbientLight 추가
        const ambientLight = new Three.AmbientLight(0xffffff, 1);
        this._scene.add(ambientLight);
    }

    _setupModel() {
        // 나무 기둥에 해당하는 cylinder 장면에 추가
        const partWidth = 50;
        const partHeight = 200;
        const geometry = new Three.CylinderGeometry(partWidth * 0.65, partWidth, partHeight, 32);

        const color = new Three.Color("#a04500");
        const material = new Three.MeshPhongMaterial({ color: color });

        const mesh = new Three.Mesh(geometry, material);
        // mesh를 y축방향으로 -partHeight / 2 만큼 이동하는 행렬 적용
        mesh.matrix.makeTranslation(0, -partHeight / 2, 0);
        // 행렬을 직접 조작할 경우에는, 렌더링될 때마다 행렬이 재계산되지 않도록 설정이 필요하다.
        mesh.matrixAutoUpdate = false;
        this._scene.add(mesh);

        // 가지를 생성하는 재귀함수 정의
        // 세 번째 인자 matrix : 가지가 놓일 기준이 되는 mesh에 대한 행렬
        // 재귀적으로 호출되면 생성한 가지 mesh의 행렬이 기준 행렬이 되어 뻗어나가게 된다.
        function tree(scene, level, matrix, color) {
            if (level === 0) return;
            const tempMatrix = new Three.Matrix4();

            // 가지1 생성 시작
            const newColor1 = color.clone();
            // green값을 증가시켜 점점 더 진한 초록색으로 만든다.
            newColor1.g += 0.7 / levels;
            const material1 = new Three.MeshPhongMaterial({ color: newColor1 });
            const mesh1 = new Three.Mesh(geometry, material1);

            // 단위행렬에서 변환 시작
            const newMatrix1 = new Three.Matrix4();
            newMatrix1
                // Y축으로 90도만큼 회전
                .multiply(tempMatrix.makeRotationY(Math.PI / 2))
                // X축으로 가지 너비의 절반만큼 이동
                .multiply(tempMatrix.makeTranslation(partWidth / 2, 0, 0))
                // Z축으로 -45도만큼 회전
                .multiply(tempMatrix.makeRotationZ(-Math.PI / 4))
                // 0.75배 배수 적용
                .multiply(tempMatrix.makeScale(0.75, 0.75, 0.75))
                // Y축으로 가지 길이만큼 이동
                .multiply(tempMatrix.makeTranslation(0, partHeight, 0));

            // mesh의 변환 행렬에 복사 
            mesh1.matrix.copy(newMatrix1.multiply(matrix));
            // 복사된 행렬값을 그대로 사용하도록 matrixAutoUpdate를 false로 설정
            mesh1.matrixAutoUpdate = false;
            scene.add(mesh1);

            // 레벨을 1 줄이고 재귀 호출, 생성한 가지가 인자로 들어간다.
            tree(scene, level - 1, newMatrix1, newColor1);

            // 가지2 생성 시작
            const newColor2 = color.clone();
            // green값을 증가시켜 점점 더 진한 초록색으로 만든다.
            newColor2.g += 0.64 / levels;
            const material2 = new Three.MeshPhongMaterial({ color: newColor2 });
            const mesh2 = new Three.Mesh(geometry, material2);

            const newMatrix2 = new Three.Matrix4();
            newMatrix2
                .multiply(tempMatrix.makeRotationY(Math.PI / 2))
                // X축 이동과 Z축 회전만 가지1과 대칭된다./////
                .multiply(tempMatrix.makeTranslation(-partWidth / 2, 0, 0))
                .multiply(tempMatrix.makeRotationZ(Math.PI / 4))
                //////////////////////////////////////////////
                .multiply(tempMatrix.makeScale(0.75, 0.75, 0.75))
                .multiply(tempMatrix.makeTranslation(0, partHeight, 0));

            mesh2.matrix.copy(newMatrix2.multiply(matrix));
            mesh2.matrixAutoUpdate = false;
            scene.add(mesh2);

            tree(scene, level - 1, newMatrix2, newColor2);
        }

        const levels = 12;
        // 가지를 생성하는 재귀함수 12레벨로 호출
        tree(this._scene, levels, mesh.matrix, color);
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);
    }

    resize() {
        // 3D 그래픽을 출력할 영역 width, height 얻어오기
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        // 출력할 영역 width, height로 aspect 계산하여 카메라 aspect를 설정
        this._camera.aspect = width / height;
        // 변경된 aspect를 바탕으로 ProjectionMatrix 업데이트
        this._camera.updateProjectionMatrix();

        // 출력 영역 크기를 바탕으로 렌더러 크기 설정
        this._renderer.setSize(width, height);
    }

    render(time) {
        // Scene을 카메라 시점으로 렌더링하라는 코드
        this._renderer.render(this._scene, this._camera);
        // update 메서드 안에서는 time 인자를 바탕으로 애니메이션 효과 발생
        this.update(time);
        // requestAnimationFrame을 통하여 render 메서드가 반복적으로 호출될 수 있다.
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        // 밀리초에서 초로 변환
        time *= 0.001;
    }
}

window.onload = function () {
    new App();
}