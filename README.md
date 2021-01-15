<img src="https://raw.githubusercontent.com/PortalCube/shany-card-name-generator/main/title_en.png"></img>
<img src="https://raw.githubusercontent.com/PortalCube/shany-card-name-generator/main/title_ko.png"></img>

# 샤이니 컬러즈 카드 이름 생성기

아이돌마스터 샤이니 컬러즈 아이돌 카드 이름을 제작하는 도구입니다.

Node.js에서 puppeteer의 스크린샷 캡쳐 기능을 활용하여, CSS와 SVG를 삽입한 HTML 페이지를 캡쳐하고 저장하는 방식으로 작동합니다.

## 사용 방법

### 설치하기

1. Node.js가 없다면 설치합니다. https://nodejs.org/en/
1. 저장소를 다운로드합니다.
1. 저장소 디렉토리 (index.js가 있는 곳) 에서 터미널을 열고 "npm i" 커맨드를 이용해서 모든 패키지를 설치합니다.

### Normal Build

노멀 모드는 번역 데이터를 생성하는 용도로 사용합니다.
노멀 모드로 생성하면 번역 서버에 추가해야되는 데이터까지 함께 생성해줍니다.

1. data-normal.csv 파일을 필요한대로 수정합니다.
1. 수정이 완료되면 "npm run normal"를 입력하여 이미지를 Normal 모드로 빌드합니다.
1. 빌드가 완료되면 result 폴더에 생성된 이미지들이 저장됩니다. image.csv에는 번역 서버에 추가해야될 텍스트가 저장됩니다.

### Simple Build

심플 모드는 단순히 카드 이름 이미지 생성하는 용도로 사용합니다. "이미지 생성"과는 상관없는 불필요한 데이터를 생략합니다.
개인적인 용도로 카드 이미지를 생성하거나, 일부 이미지를 급히 업데이트할 때 유용합니다.

1. data-simple.csv 파일을 필요한대로 수정합니다.
1. 수정이 완료되면 "npm run simple"을 입력하여 이미지를 Simple 모드로 빌드합니다.
1. 빌드가 완료되면 result 폴더에 생성된 이미지들이 저장됩니다.

## CSV 형식

각 파일의 예시는 저장소에 첨부된 파일을 참고해주세요.

### data-normal.csv

id,hash,version,type,rarity,idol_name_original,idol_name,card_name_original,card_name

-   id: 카드 id (이미지 생성 및 image.csv 출력에 필요)
-   hash: 카드 hash (image.csv 출력에 필요)
-   version: 카드 타이틀 이미지의 version (image.csv 출력에 필요)
-   type: 카드의 타입 (image.csv 출력에 필요)
-   rarity: 카드의 레어리티 (이미지 생성에 사용)
    -   1: N, 2: R, 3: SR, 4: SSR
-   idol_name_original: 아이돌 이름 원문 (미사용)
-   idol_name: 아이돌 이름 번역문 (이미지 생성에 사용)
-   card_name_original: 카드 이름 원문 (미사용)
-   card_name: 카드 이름 번역문 (이미지 생성에 사용)

참고: (미사용) 이라고 표기된 열은 비워놔도 상관없습니다.

### data-simple.csv

id,rarity,idol_name,card_name

-   id: 파일 이름 (이미지를 저장할 때, 이걸로 저장합니다)
-   rarity: 카드의 레어리티 (이미지 생성에 사용)
    -   1: N, 2: R, 3: SR, 4: SSR
-   idol_name: 아이돌 이름 (이미지 생성에 사용)
-   card_name: 카드 이름 (이미지 생성에 사용)

# 저작권

이 소프트웨어는 MIT 라이선스하에 배포됩니다. 사용자는 해당 라이선스의 조건하에 자유롭게 사용하실 수 있습니다.
