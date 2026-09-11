let type = "";


// 选择上午/下午
function setType(t){

    type = t;

    let box = document.getElementById("typeShow");

    if(box){
        box.innerHTML = "已选择：" + t;
    }

}



// 获取东京时间
function getTokyoTime(){

    let now = new Date();

    let utc =
        now.getTime()
        +
        now.getTimezoneOffset()*60000;


    // 东京 UTC+9
    return new Date(
        utc + 9*60*60*1000
    );

}



// 更新时间
function updateClock(){

    let tokyo = getTokyoTime();


    let y = tokyo.getFullYear();

    let m = tokyo.getMonth()+1;

    let d = tokyo.getDate();



    let weeks=[
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ];



    let dateBox=document.getElementById("date");

    let weekBox=document.getElementById("week");

    let clockBox=document.getElementById("clock");



    if(dateBox){

        dateBox.innerHTML =
        y+"年"+m+"月"+d+"日";

    }



    if(weekBox){

        weekBox.innerHTML =
        weeks[tokyo.getDay()];

    }



    if(clockBox){

        clockBox.innerHTML =
        tokyo.toLocaleTimeString(
            "zh-CN",
            {
                hour12:false
            }
        );

    }


}



setInterval(updateClock,1000);

updateClock();





// 保存记录
function saveData(){


    let money =
    document.getElementById("money").value;



    let method =
    document.getElementById("method").value;



    if(type===""){

        alert("请选择上午上班或下午下班");

        return;

    }



    if(money===""){

        alert("请输入金额");

        return;

    }



    let tokyo=getTokyoTime();



    let record={


        date:
        tokyo.getFullYear()
        +
        "-"
        +
        (tokyo.getMonth()+1)
        +
        "-"
        +
        tokyo.getDate(),


        time:
        tokyo.toLocaleTimeString(
            "zh-CN",
            {
                hour12:false
            }
        ),



        type:type,


        method:method,


        money:Number(money)

    };




    let data =
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



    alert("保存成功");



    document.getElementById("money").value="";


    show();


}





// 显示记录
function show(){


    let data =
    JSON.parse(
        localStorage.getItem("taxiData")
        ||
        "[]"
    );



    let html="";



    data.slice().reverse().forEach(i=>{


        html +=
        `
        <div>
        ${i.date} ${i.time}
        <br>
        ${i.type} - ${i.method}
        <br>
        金额：¥${i.money}
        </div>
        `;


    });



    let list=document.getElementById("list");


    if(list){

        list.innerHTML=html;

    }


    statistics(data);


}




// 统计
function statistics(data){


    let now=getTokyoTime();


    let week=0;

    let month=0;



    data.forEach(i=>{


        let money=i.money;


        let arr=i.date.split("-");


        let recordDate =
        new Date(
            arr[0],
            arr[1]-1,
            arr[2]
        );



        if(
            recordDate.getMonth()
            ==
            now.getMonth()
        ){

            month+=money;

        }



        let diff =
        (
            now-recordDate
        )
        /
        86400000;



        if(diff<=7){

            week+=money;

        }



    });



    document.getElementById("weekTotal").innerHTML =
    "本周交通费用：¥"
    +
    week.toFixed(2);



    document.getElementById("monthTotal").innerHTML =
    "本月交通费用：¥"
    +
    month.toFixed(2);



}



show();
