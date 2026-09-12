let type = "";


/* ==========================
   北京时间 UTC+8
========================== */

function getBeijingTime() {

    const now = new Date();

    const utc =
        now.getTime() +
        now.getTimezoneOffset() * 60000;

    return new Date(
        utc + 8 * 60 * 60 * 1000
    );
}


/* ==========================
   读取数据
========================== */

function getData() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem("taxiData") || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "读取交通记录失败：",
            error
        );

        return [];
    }
}


/* ==========================
   保存数据
========================== */

function saveAllData(data) {

    localStorage.setItem(
        "taxiData",
        JSON.stringify(data)
    );
}


/* ==========================
   选择出行类型
========================== */

function setType(t) {

    type = t;

    const box =
        document.getElementById("typeShow");

    if (box) {

        box.innerHTML =
            "已选择：" + t;
    }
}


/* ==========================
   显示北京时间
========================== */

function updateClock() {

    const beijing =
        getBeijingTime();

    const y =
        beijing.getFullYear();

    const m =
        beijing.getMonth() + 1;

    const d =
        beijing.getDate();

    const weeks = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ];


    const dateBox =
        document.getElementById("date");

    const weekBox =
        document.getElementById("week");

    const clockBox =
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

        const hh =
            String(
                beijing.getHours()
            ).padStart(2, "0");

        const mm =
            String(
                beijing.getMinutes()
            ).padStart(2, "0");

        const ss =
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


/* ==========================
   保存新记录
========================== */

function saveData() {

    const moneyInput =
        document.getElementById("money");

    const methodInput =
        document.getElementById("method");


    const money =
        moneyInput.value;

    const method =
        methodInput.value;


    if (type === "") {

        alert(
            "请选择上午上班、下午下班或周末出游"
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


    const beijing =
        getBeijingTime();


    const record = {

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

        type:
            type,

        method:
            method,

        money:
            Number(money)
    };


    const data =
        getData();


    data.push(record);


    saveAllData(data);


    alert("记录成功");


    moneyInput.value = "";


    show();
}


/* ==========================
   显示历史记录
========================== */

function show() {

    const data =
        getData();


    const list =
        document.getElementById("list");


    if (!list) {
        return;
    }


    let html = "";


    /* 顶部操作栏 */

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


    /*
       重点：
       不再使用 ID。
       直接使用记录在数组中的 index。
    */

    for (
        let index = data.length - 1;
        index >= 0;
        index--
    ) {

        const item =
            data[index];


        html += `

        <div class="record">

            <div class="record-select">

                <input
                    type="checkbox"
                    class="record-checkbox"
                    data-index="${index}"
                >

            </div>


            <div class="record-content">

                <div class="record-date">
                    ${item.date || ""}
                    ${item.time || ""}
                </div>


                <div class="record-info">
                    ${item.type || ""}
                    ·
                    ${item.method || ""}
                </div>


                <div class="record-money">
                    ¥${Number(item.money || 0).toFixed(2)}
                </div>

            </div>


            <button
                class="delete-one"
                onclick="deleteOne(${index})"
            >
                删除
            </button>

        </div>

        `;
    }


    if (data.length === 0) {

        html += `

        <div class="empty">
            暂无记录
        </div>

        `;
    }


    list.innerHTML =
        html;


    statistics(data);
}


/* ==========================
   删除单条记录
========================== */

function deleteOne(index) {

    const data =
        getData();


    index =
        Number(index);


    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= data.length
    ) {

        alert(
            "没有找到这条记录，请刷新页面后再试。"
        );

        return;
    }


    const target =
        data[index];


    const confirmDelete =
        confirm(

            "确定要删除这条记录吗？\n\n" +

            (target.date || "") +
            " " +
            (target.time || "") +
            "\n" +

            (target.type || "") +
            " · " +
            (target.method || "") +
            "\n" +

            "¥" +
            Number(
                target.money || 0
            ).toFixed(2)

        );


    if (!confirmDelete) {
        return;
    }


    /*
       直接按照数组位置删除
    */

    data.splice(
        index,
        1
    );


    saveAllData(data);


    show();
}


/* ==========================
   全选
========================== */

function toggleSelectAll(checkbox) {

    const boxes =
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


/* ==========================
   删除选中
========================== */

function deleteSelected() {

    const checkedBoxes =
        document.querySelectorAll(
            ".record-checkbox:checked"
        );


    if (
        checkedBoxes.length === 0
    ) {

        alert(
            "请先选择要删除的记录"
        );

        return;
    }


    const confirmDelete =
        confirm(

            "确定要删除选中的 " +
            checkedBoxes.length +
            " 条记录吗？"

        );


    if (!confirmDelete) {
        return;
    }


    /*
       取得所有被选中的数组位置
    */

    const indexes = [];


    checkedBoxes.forEach(
        function(box) {

            indexes.push(
                Number(
                    box.getAttribute(
                        "data-index"
                    )
                )
            );

        }
    );


    /*
       从大到小删除。
       这样删除前面的记录时，
       不会影响后面的 index。
    */

    indexes.sort(
        function(a, b) {
            return b - a;
        }
    );


    const data =
        getData();


    indexes.forEach(
        function(index) {

            if (
                index >= 0 &&
                index < data.length
            ) {

                data.splice(
                    index,
                    1
                );
            }

        }
    );


    saveAllData(data);


    show();
}


/* ==========================
   周 / 月统计
========================== */

function statistics(data) {

    const now =
        getBeijingTime();


    let week = 0;

    let month = 0;


    const currentDay =
        now.getDay();


    const mondayOffset =
        currentDay === 0
            ? 6
            : currentDay - 1;


    const monday =
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
        function(item) {

            if (!item.date) {
                return;
            }


            const arr =
                item.date.split("-");


            if (arr.length !== 3) {
                return;
            }


            const recordDate =
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


            const money =
                Number(item.money) || 0;


            /* 本月 */

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


            /* 本周 */

            if (

                recordDate >= monday

                &&

                recordDate <= now

            ) {

                week += money;
            }

        }
    );


    const weekBox =
        document.getElementById(
            "weekTotal"
        );


    const monthBox =
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


/* ==========================
   页面启动
========================== */

show();