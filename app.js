let type="";



function setType(t){

type=t;

document.getElementById("typeShow").innerHTML=
"已选择："+t;

}




function updateClock(){

let now = new Date();


let tokyo = new Date(
now.toLocaleString(
"en-US",
{
timeZone:"Asia/Tokyo"
}
)
);



document.getElementById("date").innerHTML =
tokyo.getFullYear()
+
"年"
+
(tokyo.getMonth()+1)
+
"月"
+
tokyo.getDate()
+
"日";



let weekArr=[
"星期日",
"星期一",
"星期二",
"星期三",
"星期四",
"星期五",
"星期六"
];


document.getElementById("week").innerHTML =
weekArr[tokyo.getDay()];



document.getElementById("clock").innerHTML =

tokyo.toLocaleTimeString(
"zh-CN",
{
hour12:false
}
);


}

setInterval(updateClock,1000);

updateClock();





function saveData(){


let money=
document.getElementById("money").value;


let method=
document.getElementById("method").value;



if(type===""){

alert("请选择上午上班或下午下班");

return;

}



if(money===""){

alert("请输入金额");

return;

}



let d=new Date();



let record={


date:
d.toLocaleDateString(
"zh-CN",
{
timeZone:"Asia/Tokyo"
}
),


time:
d.toLocaleTimeString(
"zh-CN",
{
timeZone:"Asia/Tokyo"
}
),


type:type,


method:method,


money:Number(money)


};



let data=
JSON.parse(
localStorage.getItem("taxiData")
||
"[]"
);



data.push(record);



localStorage.setItem(
"taxiData",
JSON.stringify(data)
);



alert("记录成功");


document.getElementById("money").value="";


show();


}





function show(){


let data=
JSON.parse(
localStorage.getItem("taxiData")
||
"[]"
);



let html="";



data.reverse().forEach(i=>{


html+=`

<div>

${i.date} ${i.time}

<br>

${i.type}
&nbsp;
${i.method}

<br>

金额：
¥${i.money}

</div>


`;


});



document.getElementById("list").innerHTML=
html;


statistics(data);


}





function statistics(data){


let now=new Date();


let week=0;

let month=0;



data.forEach(i=>{


let money=i.money;



let d=new Date(i.date);



if(
d.getMonth()==now.getMonth()
){

month+=money;

}



let days=
(now-d)/(1000*60*60*24);



if(days<=7){

week+=money;

}



});




document.getElementById("weekTotal").innerHTML=

"本周交通费用：¥"
+
week.toFixed(2);




document.getElementById("monthTotal").innerHTML=

"本月交通费用：¥"
+
month.toFixed(2);



}



show();