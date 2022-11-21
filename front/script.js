/*
1. 지도 생성 & 확대 축소 컨트롤러
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
3. 여러개 마커 찍기
	* 주소 - 좌표 변환 (지도 라이브러리)
4. 마커에 인포윈도우 붙이기
	* 마커에 클릭 이벤트로 인포윈도우
	* url에서 섬네일 따기
	* 클릭한 마커로 지도 센터 이동
5. 카테고리 분류
*/

/*
**********************************************************
1. 지도 생성 & 확대 축소 컨트롤러
https://apis.map.kakao.com/web/sample/addMapControl/

*/
var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(37.541, 126.986), //지도의 중심좌표.
	level: 8 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 일반 지도 <-> 스카이뷰 지도 타입 전환
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤 추가
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소 제어 컨트롤 생성
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/
async function getDataSet(category) {
	let qs = category;
	if (!qs) {
	  qs = "";
	}
  
	const result = await axios({
	  method: "get", // http method
	  url: `http://15.164.59.109:3000/restaurants?category=${qs}`,
	  headers: {}, // packet header
	  data: {}, // packet body
	});
	//setMap(result.data.result);
	return result.data.result;
  }
  
getDataSet();

async function setting() {
	try{
		const dataSet = await getDataSet();
		setMap(dataSet);
	} catch (error) {
		console.error(error);
	}
}

setting();

/*
**********************************************************
3. 여러개 마커 찍기
  * 주소 - 좌표 변환
https://apis.map.kakao.com/web/sample/multipleMarkerImage/ (여러개 마커)
https://apis.map.kakao.com/web/sample/addr2coord/ (주소로 장소 표시하기)
*/

// 주소 - 좌표 변환 함수
var geocoder = new kakao.maps.services.Geocoder();

async function setMap(dataSet) {
	for (place of dataSet){
		var coords = await getCoordsByAddress(place.address);
		// 결과값으로 받은 위치를 마커로 표시합니다
		var marker = new kakao.maps.Marker({
			map: map,
			position: coords
		});
	}
}

function getCoordsByAddress(address){
	return new Promise((resolve, reject) => {
		geocoder.addressSearch(address, function(result, status){
			if (status == kakao.maps.services.Status.OK){
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			} else {
				reject(new Error('getCoordsByAddress Error: not valid Address'));
			}
		});
	});
}


/* 
******************************************************************************
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우 https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동 https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data){
	// 유튜브 썸네일 가져오기
	let replaceUrl = data.url;
	let finUrl = '';
	replaceUrl = replaceUrl.replace("https://youtu.be/", '');
	replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", '');
	replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", '');
	finUrl = replaceUrl.split('&')[0];

	return `
	<div class="infowindow">
      <div class="infowindow-img-container">
        <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg" class="infowindow-img">
      </div>
      <div class="infowindow-body">
        <h5 class="infowindow-title">${data.title}</h5>
        <p class="infowindow-address">${data.address}</p>
        <a href="${data.url}" class="infowindow-btn" target="_blank">영상이동</a>
      </div>
    </div>
	`
}

var markerArray = [];
var infowindowArray = [];
var selectedInfoWindow = null;
async function setMap(dataSet) {
	for (place of dataSet){
		var coords = await getCoordsByAddress(place.address);
		// 결과값으로 받은 위치를 마커로 표시합니다
		var marker = new kakao.maps.Marker({
			map: map,
			position: coords
		});
		
		markerArray.push(marker);

		// 마커에 표시할 인포윈도우를 생성합니다 
		var infowindow = new kakao.maps.InfoWindow({
			content: getContent(place) // 인포윈도우에 표시할 내용
		});
		infowindowArray.push(infowindow);

		kakao.maps.event.addListener(marker, 'click', makeClickMarkerListener(map, marker, infowindow));
    	kakao.maps.event.addListener(map, 'click', makeClickMapListener(infowindow));	
	}
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeClickMarkerListener(map, marker, infowindow) {
    return function() {
		var latlng = new kakao.maps.LatLng(marker.getPosition().Ma, marker.getPosition().La);
		if (selectedInfoWindow && selectedInfoWindow != infowindow){
			selectedInfoWindow.close();
		}
        infowindow.open(map, marker);
		selectedInfoWindow = infowindow;
		map.panTo(latlng);  
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeClickMapListener(infowindow) {
    return function() {
        infowindow.close();
    };
}

/* 
******************************************************************************
5. 카테고리 분류
*/

// 카테고리
const categoryMap = {
	korea: '한식',
	china: "중식",
	japan: "일식",
	america: "양식",
	wheat: "분식",
	meat: "구이",
	sushi: "회/초밥",
	etc: "기타"
}

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event){
	const category = categoryMap[event.target.id];

	// 데이터 분류
	let categorizedDataset = await getDataSet(category);

	// 기존 마커 삭제
	closeMarker();

	// 기존 인포윈도우 삭제
	closeInfoWindow();

	// 특정 카테고리 마커 생성
	setMap(categorizedDataset);
}

function closeMarker(){
	for (marker of markerArray){
		marker.setMap(null);
	}
}

function closeInfoWindow(){
	for (infowindow of infowindowArray){
		infowindow.close();
	}
}