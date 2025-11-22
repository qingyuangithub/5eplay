
const modeDict = {
    "全部模式": -1, "天梯组排": -12, "天梯绿色": -120, "官匹pro": 41, "天梯单排": -46, "单排绿色": -460
};

const API_URLS = {
    getInGameUserSetBySid:"https://appactivity.wmpvp.com/steamcn/app/realtime/getInGameUserSetBySid?steamIds=",//获取玩家游戏状态 [在线/离线] [国服/平台]
    SEARCH: "https://appengine.wmpvp.com/steamcn/app/search/user",//完美昵称搜索接口
    ACCOUNTS: "https://appengine.wmpvp.com/steamcn/community/user/getNewUserList",//完美绑定账号关联接口
    FORBID: "https://api.wmpvp.com/api/csgo/home/user/forbid",//玩家封禁状态获取接口
    MATCHES: "https://api.wmpvp.com/api/csgo/home/match/list",//玩家比赛记录数据接口
    STATS: "https://api.wmpvp.com/api/csgo/home/pvp/detailStats",//完美平台数据获取接口
    INVENTORY: "https://gwapi.pwesports.cn/appdecoration/steamcn/csgo/decoration/getSteamInventoryPreview",//玩家CS2饰品库存数据接口
    OFFICIAL_STATS: "https://api.wmpvp.com/api/csgo/home/official/detailStats",//玩家国服数据获取接口
    CSINFO: "https://gwapi.pwesports.cn/appdatacenter/csgo/official/fall/userCsgoInfo",//获取优先状态
    STEAM_DATA: "https://steamrepcn.com/profiles/"//steam社区数据获取接口
};

const mockUserData = [
    { 'steamID': '76561199721184339', 'userID': '1026293222', 'token': '7667e792473259e7e40cd7658b1681a0d2a7ce6c' },
    { 'steamID': '76561199697817037', 'userID': '1022646069', 'token': '8dfa964afe38a638488b66f55b32d601e1a4e79a' },
    { 'steamID': '76561199722026486', 'userID': '1026158310', 'token': '69b506ce5b3be3ba49622305851baf2b72df1ed1'}
];

function getRandomUser() {
    return mockUserData[Math.floor(Math.random() * mockUserData.length)];
}

function getHeaders(token) {
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://csgo.wmpvp.com/",
        'appversion': '3.6.2.189',
        'device': 'KGPSz1754474645YpsvmPeeMtb',
        'gameType': '2',
        'gameTypeStr': '2',
        'platform': 'android',
        'appTheme': '0',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
    };
    if (token) headers["token"] = `${token}`;
    return headers;
}

// 根据分数获取段位颜色（与提供的图片匹配）
function getRankColor(score) {
    if (score >= 2800) return "#FFD700"; // S星级 - 金色（带星光效果）
    else if (score >= 2601) return "#F9B641"; // S - 浅金色
    else if (score >= 2401) return "#FF7A00"; // A+ - 深橙色
    else if (score >= 2201) return "#FF5700"; // A - 橙色
    else if (score >= 2001) return "#D81F26"; // B+ - 深红色
    else if (score >= 1801) return "#C41E3A"; // B - 红色
    else if (score >= 1601) return "#9333EA"; // C+ - 深紫色
    else if (score >= 1301) return "#A020F0"; // C - 紫色
    else if (score >= 1001) return "#4F70FF"; // D+ - 亮蓝色
    else if (score >= 0) return "#4A6CF7"; // D - 蓝色
    return "#808080"; // 未定级 - 灰色
}

// 根据分数获取段位文本（按指定区间划分）
function getRankText(score) {
    if (score >= 2800) {
        const stars = Math.floor((score - 2800) / 50) + 1;
        return `S ${'★'.repeat(stars)}`;
    } else if (score >= 2601) return "S";
    else if (score >= 2401) return "A+";
    else if (score >= 2201) return "A";
    else if (score >= 2001) return "B+";
    else if (score >= 1801) return "B";
    else if (score >= 1601) return "C+";
    else if (score >= 1301) return "C";
    else if (score >= 1001) return "D+";
    else if (score >= 0) return "D";
    return "未定级";
}

// 根据SteamID搜索完美平台用户信息
async function searchUsers(steamId) {
    if (!steamId || ["N/A", "未知", ""].includes(steamId.toString().trim())) {
        return null;
    }
    try {
        const { token } = getRandomUser();
        const headers = getHeaders(token);
        const response = await fetch(API_URLS.SEARCH, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                keyword: steamId,
                page: 1,
                pageSize: 10,
                searchType: 1 // 1 表示按 SteamID 搜索
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // 检查返回数据结构是否符合预期
        if (data.result) {
            return data.result[0]; // 返回第一个匹配的用户
        }
        return null; // 未找到用户或数据格式不正确
    } catch (e) {
        console.error("搜索完美用户错误:", e);
        return null;
    }
}

// 获取完美平台账号封禁信息
async function getAccountForbidInfo(steamId) {
    if (!steamId) {
        return "未知";
    }
    try {
        const { steamID: mySteamId, token } = getRandomUser();
        const headers = getHeaders(token);

        const response = await fetch(API_URLS.FORBID, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                toSteamId: steamId,
                mySteamId: mySteamId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.statusCode === 0 && data.data) {
            const forbidDetail = data.data;
            if ([0, null, undefined].indexOf(forbidDetail.pwaBanType) === -1) {
                const expireDate = timestampToDate(forbidDetail.expireTime);
                const createDate = timestampToDate(forbidDetail.createTime);
                const desc = forbidDetail.desc || "未说明封禁原因";
                return `存在封禁记录\n封禁原因：${desc}\n封禁时间：${createDate}\n解封时间：${expireDate}`;
            } else {
                return "状态正常";
            }
        } else {
            return `封禁查询失败：${data.errorMessage || '未知错误'}`;
        }
    } catch (e) {
        console.error("获取封禁信息错误:", e);
        return "查询失败";
    }
}

async function getCsInfo(steamId) {
    if (!steamId) {
        return "无法获取优先状态";
    }
    try {
        const { token } = getRandomUser();
        const params = new URLSearchParams({ steamId: steamId, token: token, darkType: '0' });
        const response = await fetch(`${API_URLS.CSINFO}?${params.toString()}`, { method: "GET", headers: getHeaders() });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.result && data.result.levelTitle) {
            return `优先用户 ${data.result.levelTitle}-${data.result.curLevel}级`;
        }
        return "非优先用户";
    } catch (e) {
        console.error("获取CS信息错误:", e);
        return "无法获取优先状态";
    }
}

async function getPvPStats(steamId) {//获取完美数据
    if (!steamId || ["N/A", "未知", ""].includes(steamId.toString().trim())) {
        return null;
    }
    try {
        const { steamID: mySteamId, token } = getRandomUser();
        const headers = getHeaders(token);
        const response = await fetch(API_URLS.STATS, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ toSteamId: steamId, mySteamId: mySteamId, accessToken: token })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.statusCode === 0 && data.data) {
            if (data.data.playTime) {
                data.data.playTimeHours = parseFloat((data.data.playTime / 3600).toFixed(1));
            }
            return data.data;
        }
        return null;
    } catch (e) {
        console.error("获取国服统计错误:", e);
        return null;
    }
}

async function getOfficialStats(steamId) {
    //获取国服数据
    if (!steamId || ["N/A", "未知", ""].includes(steamId.toString().trim())) {
        return null;
    }
    try {
        const { steamID: mySteamId, token } = getRandomUser();
        const headers = getHeaders(token);
        const response = await fetch(API_URLS.OFFICIAL_STATS, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ toSteamId: steamId, mySteamId: mySteamId, accessToken: token })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.statusCode === 0 && data.data) {
            if (data.data.playTime) {
                data.data.playTimeHours = parseFloat((data.data.playTime / 3600).toFixed(1));
            }
            return data.data;
        }
        return null;
    } catch (e) {
        console.error("获取国服统计错误:", e);
        return null;
    }
}

// 获取完美平台比赛数据
async function getAccountMatches(steamId) {
    if (!steamId || ["N/A", "未知", ""].includes(steamId.toString().trim())) {
        return [];
    }
    try {
        const { steamID: mySteamId, token } = getRandomUser();
        const headers = getHeaders(token);
        const response = await fetch(API_URLS.MATCHES, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                mySteamId: mySteamId,
                toSteamId: steamId,
                csgoSeasonId: "recent",
                pvpType: modeDict["全部模式"],
                page: 1,
                pageSize: 9999,
                dataSource: 3
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.statusCode === 0 && data.data && data.data.matchList) {
            return data.data.matchList;
        }
        return [];
    } catch (e) {
        console.error("获取比赛数据错误:", e);
        return [];
    }
}

// 从 searchUsers 的结果中获取最高评分
function getUserMaxScore(perfectUserInfo) {

    if (!perfectUserInfo) {
        return "无数据";
    }
    let PvPScore = perfectUserInfo.map(Score => Score.pvpScore);
    let MaxScore = Math.max(...PvPScore);
    console.log(MaxScore);
    return MaxScore;
}

// 时间戳转换函数 (原代码中缺失)
function timestampToDate(timestamp) {
    if (!timestamp) return "未知";
    const date = new Date(timestamp);
    return date.toLocaleString();
}