let type = "";


// ==============================
// 北京时间 UTC+8
// ==============================

function getBeijingTime() {

    let now = new Date();

    let utc =
        now.getTime() +
        now.getTimezoneOffset() * 60000;

    return new Date(
        utc + 8 * 60 * 60 * 1000
    );

}



// ==============================
// 选择上班 / 下班
// ==============================

function setType(t) {

    type = t;

    let box =
        document.getElementById("typeShow");

    if (box) {

        box.innerHTML =
            "已选择：" + t;

    }

}



// ==============================
// 更新时间
// ==============================

function updateClock() {

    let beijing =
        getBeijingTime();


    let y =
        beijing.getFullYear();

    let m =
        beijing.getMonth() + 1;

    let d =
        beijing.getDate();


    let weeks = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ];


    let dateBox =
        document.getElementById("date");

    let weekBox =
        document.getElementById("week");

    let clockBox =
        document.getElementById("clock");


    if (dateBox) {

        dateBox.innerHTML =
            y + "年" +
            m + "月" +
            d + "日";

    }


    if (weekBox) {

        weekBox.innerHTML =
            weeks[beijing.getDay()];

    }


    if (clockBox) {

        let hh =
            String(
                beijing.getHours()
            ).padStart(2, "0");


        let mm =
            String(
                beijing.getMinutes()
            ).padStart(2, "0");


        let ss =
            String(
                beijing.getSeconds()
            ).padStart(2, "0");


        clockBox.innerHTML =
            hh + ":" +
            mm + ":" +
            ss;

    }

}


setInterval(
    updateClock,
    1000
);

updateClock();



// ==============================
// 保存记录
// ==============================

function saveData() {

    let money =
        document.getElementById(
            "money"
        ).value;


    let method =
        document.getElementById(
            "method"
        ).value;


    if (type === "") {

        alert(
            "请选择上午上班或下午下班"
        );

        return;

    }


    if (
        money === "" ||
        Number(money) < 0
    ) {

        alert(
            "请输入正确的金额"
        );

        return;

    }


    let beijing =
        getBeijingTime();


    let record = {

        id:
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8),


        date:
            beijing.getFullYear() +
            "-" +
            String(
                beijing.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                beijing.getDate()
            ).padStart(2, "0"),


        time:
            String(
                beijing.getHours()
            ).padStart(2, "0") +
            ":" +
            String(
                beijing.getMinutes()
            ).padStart(2, "0") +
            ":" +
            String(
                beijing.getSeconds()
            ).padStart(2, "0"),


        type: type,


        method: method,


        money: Number(money)

    };


    let data =
        JSON.parse(
            localStorage.getItem(
                "taxiData"
            ) || "[]"
        );


    data.push(record);


    localStorage.setItem(
        "taxiData",
        JSON.stringify(data)
    );


    alert("记录成功");


    document.getElementById(
        "money"
    ).value = "";


    show();

}



// ==============================
// 显示历史记录
// ==============================

function show() {

    let data =
        JSON.parse(
            localStorage.getItem(
                "taxiData"
            ) || "[]"
        );


    let list =
        document.getElementById(
            "list"
        );


    if (!list) {
        return;
    }


    let html = "";


    // 顶部操作栏

    if (data.length > 0) {

        html += `

        <div class="list-actions">

            <label>

                <input
                    type="checkbox"
                    id="selectAll"
                    onchange="toggleSelectAll(this)"
                >

                全选

            </label>


            <button
                class="delete-selected"
                onclick="deleteSelected()"
            >

                删除选中

            </button>

        </div>

        `;

    }



    // 最新记录放在最上面

    data
        .slice()
        .reverse()
        .forEach(function(i) {


            html += `

            <div class="record">

                <div class="record-select">

                    <input
                        type="checkbox"
                        class="record-checkbox"
                        data-id="${i.id}"
                    >

                </div>


                <div class="record-content">

                    <div class="record-date">

                        ${i.date}
                        ${i.time}

                    </div>


                    <div class="record-info">

                        ${i.type}
                        ·
                        ${i.method}

                    </div>


                    <div class="record-money">

                        ¥${Number(i.money).toFixed(2)}

                    </div>

                </div>


                <button
                    class="delete-one"
                    onclick="deleteOne('${i.id}')"
                >

                    删除

                </button>

            </div>

            `;

        });


    if (data.length === 0) {

        html += `

        <div class="empty">

            暂无记录

        </div>

        `;

    }


    list.innerHTML = html;

}



// ==============================
// 删除单条记录
// ==============================

function deleteOne(id) {

    let data =
        JSON.parse(
            localStorage.getItem(
                "taxiData"
            ) || "[]"
        );


    let target =
        data.find(
            function(item) {
                return item.id === id;
            }
        );


    if (!target) {
        return;
    }


    let confirmDelete =
        confirm(
            "确定要删除这条记录吗？\n\n" +
            target.date +
            " " +
            target.time +
            "\n" +
            target.type +
            " · " +
            target.method +
            "\n" +
            "¥" +
            Number(
                target.money
            ).toFixed(2)
        );


    if (!confirmDelete) {
        return;
    }


    data =
        data.filter(
            function(item) {
                return item.id !== id;
            }
        );


    localStorage.setItem(
        "taxiData",
        JSON.stringify(data)
    );


    show();

}



// ==============================
// 全选 / 取消全选
// ==============================

function toggleSelectAll(checkbox) {

    let boxes =
        document.querySelectorAll(
            ".record-checkbox"
        );


    boxes.forEach(
        function(box) {

            box.checked =
                checkbox.checked;

        }
    );

}



// ==============================
// 删除选中记录
// ==============================

function deleteSelected() {

    let boxes =
        document.querySelectorAll(
            ".record-checkbox:checked"
        );


    if (boxes.length === 0) {

        alert(
            "请先选择要删除的记录"
        );

        return;

    }


    let ids = [];


    boxes.forEach(
        function(box) {

            ids.push(
                box.getAttribute(
                    "data-id"
                )
            );

        }
    );


    let confirmDelete =
        confirm(
            "确定要删除选中的 " +
            boxes.length +
            " 条记录吗？"
        );


    if (!confirmDelete) {
        return;
    }


    let data =
        JSON.parse(
            localStorage.getItem(
                "taxiData"
            ) || "[]"
        );


    data =
        data.filter(
            function(item) {

                return !ids.includes(
                    item.id
                );

            }
        );


    localStorage.setItem(
        "taxiData",
        JSON.stringify(data)
    );


    show();

}



// ==============================
// 统计
// ==============================

function statistics(data) {

    let now =
        getBeijingTime();


    let week = 0;

    let month = 0;



    // 今天所在周的星期

    let currentDay =
        now.getDay();


    // 把星期日当作上一周的最后一天
    let mondayOffset =
        currentDay === 0
            ? 6
            : currentDay - 1;


    let monday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() -
                mondayOffset
        );


    monday.setHours(
        0,
        0,
        0,
        0
    );



    data.forEach(
        function(i) {


            let arr =
                i.date.split("-");


            if (arr.length !== 3) {
                return;
            }


            let recordDate =
                new Date(
                    Number(arr[0]),
                    Number(arr[1]) - 1,
                    Number(arr[2])
                );


            recordDate.setHours(
                0,
                0,
                0,
                0
            );


            let money =
                Number(i.money) || 0;



            // 本月

            if (

                recordDate.getFullYear()
                    ===
                now.getFullYear()

                &&

                recordDate.getMonth()
                    ===
                now.getMonth()

            ) {

                month += money;

            }



            // 本周

            if (
                recordDate >= monday
                &&
                recordDate <= now
            ) {

                week += money;

            }

        }
    );



    let weekBox =
        document.getElementById(
            "weekTotal"
        );


    let monthBox =
        document.getElementById(
            "monthTotal"
        );


    if (weekBox) {

        weekBox.innerHTML =
            "本周交通费用：¥" +
            week.toFixed(2);

    }


    if (monthBox) {

        monthBox.innerHTML =
            "本月交通费用：¥" +
            month.toFixed(2);

    }

}



// ==============================
// 页面初始化
// ==============================

show();