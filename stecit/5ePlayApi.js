const imgeshost = 'https://oss-arena.5eplay.com/';
const homeHost = 'https://arena.5eplay.com/data/player/';

const WE_idTransfer = 'https://gate.5eplay.com/userinterface/http/v1/userinterface/idTransfer';//uuid获取接口
const WE_home = 'https://gate.5eplay.com/crane/http/api/data/player/home?uuid='; // 用户生涯数据接口
const WE_best_season = 'https://gate.5eplay.com/crane/http/api/data/player/best_season?uuid=';//用户主页数据接口
const WE_macthlist_api = 'https://gate.5eplay.com/crane/http/api/data/match/list';//用户比赛列表接口
const WE_match = 'https://gate.5eplay.com/crane/http/api/data/match/';//对局详细接口
const WE_userinterface = 'https://gate.5eplay.com/userinterface/pt/v1/userinterface/header/';
const WE_steamName = 'https://api-client-arena.5eplay.com/api/user/steam_username/';//5E steam获取5e昵称接口
//模式映射表
const WE_account_status = {'0':'账户正常','-4':'开挂封禁','-6':'违规行为',}

const statusToImageUrl = {
'-2': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_illegality_ban.png',   // 非法行为
'-4': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_cheating_ban.png',       // 作弊行为
'-5': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_cheating_association_ban.png',  // 作弊关联行为
'-6': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_unlawful_act_ban.png',  // 违规行为
'-7': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_malicious_act_ban.png',  // 恶意行为
'-8': 'https://oss-arena.5eplay.com/ya_static/images/personalInfo/ban/player_risk_ban.png'           // 风险行为
};

//5E接口函数
function get_player(keyword) {
  const targetLink = `https://arena.5eplay.com/api/search/player/1/16?keywords=${keyword}`;
  const urlo = `https://api.allorigins.win/get?url=${encodeURIComponent(targetLink)}`
  return fetch(urlo)
    .then(response => response.json())
    .then(proxyData => {
      const JsonData = JSON.parse(proxyData.contents);
      return JsonData; // 返回解析后的数据，供后续 .then 使用
    })
    .catch(error => {
      showCopyToast('数据请求超时了Q*Q请稍后重试','error','color: #9E9E9E;');
      console.error('❌ 访问失败：', error);
      return null; // 错误时返回 null，避免后续报错
    });
}

function get_5Ename(steamId){
    let steamNameapi = `${WE_steamName}${steamId}`
    return fetch(steamNameapi)
    .then(response => response.json())
    .then(proxyData => {
        let WEname = proxyData.data.username;
        return WEname;
    })
    .catch(error => {
        return null
    })
}

function get_uuid(domain) {
  //获取用户uuid
  const header_ = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-cn",
    "authorization": "",
    "content-type": "application/json",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "x-ca-key": "5eplay",
    "x-ca-signature": "pm/c+nYSScWXLOYG7WCczBallQAPFsQ+mu3szgvr7xg=",
    "x-ca-signature-headers": "Accept-Language,Authorization",
    "x-ca-signature-method": "HmacSHA256"
  };
  return fetch(WE_idTransfer, {
    method: 'POST',
    headers: header_,
    body: JSON.stringify({ 'trans': { 'domain': domain } })
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
    .then(PostData => {
      if (PostData && PostData.data && PostData.data.uuid) {
        return PostData.data.uuid;
      } else {
        console.warn('获取 UUID 数据结构异常:', PostData);
        return '获取失败';
      }
    })
    .catch(error => {
      console.error('❌ 获取 UUID 失败：', error);
      return '获取失败';
    });
}

function get_macthlist(uuid){
    if (uuid === '获取失败') return Promise.resolve(null);
    let params = {
    'match_type':-1,
    'page':1,
    'date':0,
    'start_time':0,
    'end_time':0,
    'uuid': uuid,
    'limit':99999,
    'cs_type':0,
    }
    const queryString = new URLSearchParams(params).toString();
    const targetUrl = `${WE_macthlist_api}?${queryString}`;
    return fetch(targetUrl, { method: 'GET' })
    .then(response => response.json())
    .then(proxydata=> {
        if (proxydata && proxydata.data && proxydata.data.length > 0) {
            if (proxydata.code !== 500){
                for (let i = 0; i < proxydata.data.length; i++) {
                    if (proxydata.data[i].game_mode === "6" && "24" && "103") {
                        return proxydata.data[i].match_id
                    }else{
                        continue
                    }
                }
            }
        }
        return null;
    }).catch(error => {
        console.error('❌ 获取比赛列表失败：', error);
        return null;
    })
}

function get_home(uuid) {
  if (uuid === '获取失败') return Promise.resolve(null);
  let homeURL = WE_home + uuid
  return fetch(homeURL)
    .then(response => response.json())
    .then(postData => {
      if (postData && postData.data && postData.data.season_data && postData.data.season_data["9"]) {
        return postData.data.season_data["9"];
      }
      return null;
    })
    .catch(error => {
      console.error('❌ 获取主页数据失败：', error);
      return null;
    });
}

function get_userData(uuid){
    if (uuid === '获取失败') return Promise.resolve(null);
    let userinterfaceUrl = WE_userinterface + uuid;
    return fetch(userinterfaceUrl)
    .then(response => response.json())
    .then(postData => {
        if (postData && postData.data && postData.data.header && postData.data.header.user_data) {
            return postData.data.header.user_data;
        }
        return null;
    })
    .catch(error => {
      console.error('❌ 获取用户状态数据失败：', error);
      return null;
    });
}

function get_steamID(matchId, targetUuid) {
  if (!matchId || targetUuid === '获取失败') return Promise.resolve(null);
  const targetUrl = `${WE_match}${matchId}`;
  return fetch(targetUrl)
    .then(response => response.json())
    .then(postData => {
      if (!postData || !postData.data || !postData.data.group_1 || !postData.data.group_2) {
          return null;
      }
      let group = postData.data.group_1.concat(postData.data.group_2);
      for (let i = 0; i < group.length; i++) {
        const player = group[i];
        if (player && player.user_info && player.user_info.user_data && player.user_info.user_data.uuid === targetUuid && player.user_info.user_data.steam && player.user_info.user_data.steam.steamId) {
          return player.user_info.user_data.steam.steamId;
        }
      }
      return null;
    })
    .catch(error => {
      console.error("❌ 获取 SteamID 失败:", error);
      return null;
    });
}

function get_steamData(steamId) {//获取steam社区数据
    if (!steamId) return Promise.resolve(null);
    return fetch(`https://download.imagedownloader.online/?url=https://steamrepcn.com/profiles/${steamId}`)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const listContainer = doc.querySelector('div[class="flex w-full justify-between"]');
      const avatarContainer = doc.querySelector('div[class="flex px-5"]');
      const steamNameElement = doc.querySelector('p[class="mb-2 truncate text-4xl font-bold leading-tight"]');
      if (!listContainer || !avatarContainer || !steamNameElement) {
          return null;
      }
      const listText = listContainer.querySelectorAll('div[class="flex flex-col"]');
      const SteamifonData = {}
      SteamifonData['steam_avatar'] = avatarContainer.querySelector('img').src || null;
      SteamifonData['SteamName'] = steamNameElement.getAttribute('title') || null;
      listText.forEach(element => {
        try {
          const mlElement = element.querySelector('p[class="ml-2"]');
          const textElement = element.querySelector('p[class="ml-2 text-gray-400 text-sm"]');
          if (mlElement && textElement) {
              const ml = mlElement.innerText.trim();
              const text = textElement.innerText.trim();
              SteamifonData[ml] = text;
          }
        } catch (e) {}
      });
    return SteamifonData;
    }).catch(error => {
      console.error("❌ 获取 Steam 数据失败:", error);
      return null;
    });
}

//工具(转换时间戳)
function convertTimestamp(timestamp) {
  if (!timestamp) return "未知";
  const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
  return new Date(ms).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

