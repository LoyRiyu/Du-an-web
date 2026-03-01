/* ─── CONFIG.JS — Toàn bộ data thuần, không có logic ─── */

// ══ API KEYS ══
export const API_BUNKER = [
    "AIzaSy" + "BvqhsQ7v6" + "7xwAwiNxS3klNwmcKhP6DT8o",
    "AIzaSy" + "CkCH6xCK_WsnuXyy" + "64EIIIDKJJdNF0z5g",
    "AIzaSy" + "C4Nz1G1zFNA2z8MG" + "pDLedbwGAZn_Zuy2U",
    "AIzaSy" + "CME3gv9x_JjpcUDe" + "rxw-_YfOVqu6Fxblo",
    "AIzaSy" + "BYi9Rpdpld2pfbKx" + "CvFhKWMYvf1m91rKY",
    "AIzaSy" + "BVPHAJysryTusPA3" + "fx4y6-H8B_jwp2ab4",
    "AIzaSy" + "BENpIYLfoUQaNEl2" + "Tl_T9kQq5Z9ubVLT8",
    "AIzaSy" + "BY1wIY1S_oHE_XpD" + "tQsh4cv32ux3OSxk0",
    "AIzaSy" + "DoWZJaVeaQsyZbkj" + "aAS9X5UUPU1YwJf1g",
    "AIzaSy" + "A87JwrpGdumJkHJp" + "u13G0AN6BRGq6RIKk",
    "AIzaSy" + "AT0pz0eO2JKEQdS3" + "R9P4qoyl__cG71zXk",
    "AIzaSy" + "A02QkWlyP0ym-W-G" + "y8GRkMXenRUwR5rJw",
    "AIzaSy" + "AGITriYKn2mEgDYl" + "bMigSu-lFkPzTJBwU",
    "AIzaSy" + "B7VDjPrtIWV6RBzS" + "HWrqWmh9PgoU3Y0Fg",
    "AIzaSy" + "CMUz-AZXXPHNJ51h" + "9JDVF065HT_D2PNzg",
    "AIzaSy" + "DsmRPTWH89WW_vGb" + "VOnrGJx4398JvkQX8",
    "AIzaSy" + "D2pHt3kYaZ9oXlOV" + "1ysoJH2OMcvlBWH6E",
    "AIzaSy" + "CqmUB2qwYL-yRt3b" + "6SwioqI6lRIYItYbk",
    "AIzaSy" + "DeD59rq1PyHccy_w" + "g6UkgeUvkcQiaGcKA",
    "AIzaSy" + "AKZLcQkV_iG5qo4n" + "7w0G6RbGmbfRmn0yM",
    "AIzaSy" + "DtuqR0XvVUM15W7x" + "MpY381b6X7uRMojnU",
    "AIzaSy" + "Chv-SNFYgtvAA-dq" + "0Lw5ncRSBH52jXIgU",
    "AIzaSy" + "DffoYIf1V2uTbBra" + "XWlCLbRe8GYI7joVk",
    "AIzaSy" + "BG-VpzIEZ" + "dY_9L-aTAi2S6jLLRhoRfzbk",
    "AIzaSy" + "ClbEJ9z45" + "jBw4RwA0k8Z-uDtSWpNBByxc",
    "AIzaSy" + "CufjIA8oY" + "vSR5ugxt9iHMSl_nwIZIYqzs",
    "AIzaSy" + "CeUtH22q4" + "N-ntma7m-kAW1Ctie5ViOzgw"
];

// ══ ĐỘ KHÓ ══
export const DIFFICULTIES = {
    normal: {
        money: 6000000, time: 25, morale: 100, moraleFloor: 20,
        qualityBad: 60, qualityGood: 110,
        rateAI: 0.15, rateStatic: 0.20, guaranteeAt: 6,
        penaltyMult: 1.0, winMin: 40, winMax: 60
    },
    expert: {
        money: 4500000, time: 22, morale: 80, moraleFloor: 25,
        qualityBad: 70, qualityGood: 120,
        rateAI: 0.22, rateStatic: 0.30, guaranteeAt: 4,
        penaltyMult: 1.3, winMin: 37, winMax: 55
    },
    asian: {
        money: 3000000, time: 19, morale: 65, moraleFloor: 30,
        qualityBad: 80, qualityGood: 140,
        rateAI: 0.22, rateStatic: 0.35, guaranteeAt: 3,
        penaltyMult: 1.6, winMin: 30, winMax: 50
    }
};

// ══ THỨ TỰ GIAI ĐOẠN ══
export const STAGE_ORDER = [
    'start','stage_2','stage_3','stage_4','stage_5',
    'stage_6','stage_7','stage_8','stage_9','stage_10'
];

// ══ STORY DATA ══
export const STORY = {
    start: {
        theme: "Lập kế hoạch và chuẩn bị cơ sở vật chất (kệ sách, sơn tường, dọn dẹp phòng trống).",
        text: "<b>GIAI ĐOẠN 1: KẾ HOẠCH CƠ SỞ VẬT CHẤT</b><br>Dự án Thư viện Ước mơ khởi động! Căn phòng đang trống rỗng. Quyết định của Trưởng dự án về hạng mục Kệ sách?",
        image: "https://image2url.com/r2/default/images/1772112309351-aa0d854c-c899-409f-81c4-1ee44033ac9c.jpg",
        choices: [
            { text: "Mua kệ nhôm kính lắp ráp (Nhanh nhưng tốn).", next: "stage_2", effect: { money: -3000000, time: -2, quality: 25 } },
            { text: "Tự mua gỗ pallet về cưa xẻ đóng tay (Cực kỳ tốn sức).", next: "stage_2", effect: { money: -500000, time: -5, morale: -15, quality: 10 } },
            { text: "Xin lại kệ cũ của các lớp 12 ra trường.", next: "stage_2", effect: { money: -200000, time: -4, morale: -5, quality: 15 } }
        ]
    },
    stage_2: {
        theme: "Tìm kiếm nguồn sách, phân loại tài liệu cho thư viện.",
        text: "<b>GIAI ĐOẠN 2: TÌM KIẾM NGUỒN SÁCH</b><br>Đã có kệ. Giờ cần sách để lấp đầy. Bạn sẽ xây dựng kho tri thức này như thế nào?",
        image: "https://image2url.com/r2/default/images/1772112368557-2f824ca9-d62c-4b7b-b6d5-cf75107ed5db.jpg",
        choices: [
            { text: "Trích quỹ ra tiệm sách cũ mua sỉ theo lô.", next: "stage_3", effect: { money: -1500000, time: -1, quality: 15 } },
            { text: "Phát động quyên góp từng lớp học.", next: "stage_3", effect: { time: -4, morale: -10, quality: 10 } },
            { text: "Kêu gọi tài trợ từ các nhà xuất bản trên Facebook.", next: "stage_3", effect: { money: -100000, time: -3, morale: -5, quality: 20 } }
        ]
    },
    stage_3: {
        theme: "Logistics, vận chuyển đồ đạc vật liệu nặng nề về điểm tập kết.",
        text: "<b>GIAI ĐOẠN 3: VẬN CHUYỂN</b><br>Vật liệu đang ở khắp nơi. Bạn cần gom tất cả về điểm trường dưới trời nắng gắt.",
        image: "https://image2url.com/r2/default/images/1772112478729-87df9703-9ad9-4841-b28d-d5aa14deb860.jpg",
        choices: [
            { text: "Thuê luôn xe ba gác máy chở 1 chuyến là xong.", next: "stage_4", effect: { money: -600000, time: -1 } },
            { text: "Chia cả nhóm thành xe máy, chở thành 5-6 chuyến.", next: "stage_4", effect: { money: -100000, time: -2, morale: -15 } },
            { text: "Mượn xe đạp lôi của bác bảo vệ, tự đạp tự chở.", next: "stage_4", effect: { time: -3, morale: -20 } }
        ]
    },
    stage_4: {
        theme: "Khủng hoảng nhân sự, thành viên ốm đau, thiếu hụt người làm việc nặng.",
        text: "<b>GIAI ĐOẠN 4: KHỦNG HOẢNG NHÂN SỰ</b><br>Làm việc quá mệt. 2 bạn nam gánh vác việc nặng nhất xin phép nghỉ ốm 3 ngày.",
        image: "https://image2url.com/r2/default/images/1772112521057-70e3b489-cfb6-4272-8ae6-faea8e282d01.jpg",
        choices: [
            { text: "Trích quỹ thuê thợ ngoài làm tiếp phần việc nặng.", next: "stage_5", effect: { money: -1500000, time: -1, morale: 10, quality: 10 } },
            { text: "Bắt ép các bạn nữ OT (Làm thêm giờ) để gánh team.", next: "stage_5", effect: { time: -2, morale: -30 } },
            { text: "Bỏ bớt các hạng mục treo tường phức tạp để dễ làm hơn.", next: "stage_5", effect: { time: -1, morale: 5, quality: -15 } }
        ]
    },
    stage_5: {
        theme: "Giải quyết mâu thuẫn nội bộ, đối phó với thành viên lười biếng hoặc vô kỷ luật.",
        text: "<b>GIAI ĐOẠN 5: ĐIỀU PHỐI THÀNH VIÊN</b><br>Bạn phát hiện bạn Tùng đang chui vào góc bấm điện thoại chơi game khi mọi người đang đổ mồ hôi.",
        image: "https://image2url.com/r2/default/images/1772112558986-3662e854-5f1e-465c-a343-7ffae1569ffb.jpg",
        choices: [
            { text: "Quát thẳng mặt Tùng trước cả nhóm để lập lại kỷ luật.", next: "stage_6", effect: { morale: -20, quality: -5 } },
            { text: "Kéo Tùng ra riêng hỏi thăm, đổi cho Tùng làm việc nhẹ.", next: "stage_6", effect: { time: -1, morale: 15, quality: 10 } },
            { text: "Lẳng lặng làm bù phần việc của Tùng để tránh cãi vã.", next: "stage_6", effect: { time: -1, morale: -15, quality: 5 } }
        ]
    },
    stage_6: {
        theme: "Kiểm tra chất lượng đầu vào, lọc đồ cũ/hỏng có nguy cơ gây hại.",
        text: "<b>GIAI ĐOẠN 6: KIỂM SOÁT CHẤT LƯỢNG</b><br>Tá hỏa phát hiện sách quyên góp có lẫn lộn truyện bạo lực, ngôn tình 18+ không hợp với trẻ em.",
        image: "https://image2url.com/r2/default/images/1772112657879-d997f6ed-2c44-42a0-8468-2565dab08eac.jpg",
        choices: [
            { text: "Đình chỉ việc trang trí, huy động toàn bộ thức đêm lọc sách.", next: "stage_7", effect: { time: -3, morale: -25, quality: 25 }, bgRep: 1 },
            { text: "Mua bánh kẹo dụ dỗ học sinh lớp bên cạnh sang ngồi lọc phụ.", next: "stage_7", effect: { money: -300000, time: -1, morale: 5, quality: 15 } },
            { text: "Nhắm mắt làm ngơ. Sắp xếp hết lên kệ cao.", next: "stage_7", effect: { quality: -35 }, bgRep: -2,
              delayed: { triggerStage: "stage_9", effect: { quality: -20, morale: -15 }, message: "🔍 Hậu quả muộn: BGH Thanh tra phát hiện sách không phù hợp. Uy tín dự án bị ảnh hưởng nghiêm trọng!" }
            }
        ]
    },
    stage_7: {
        theme: "Xử lý sự cố bất khả kháng từ môi trường (Mưa, bão, cúp điện, dột nước).",
        text: "<b>GIAI ĐOẠN 7: SỰ CỐ THỰC ĐỊA</b><br>Bão về! Mái tôn cũ bị dột một lỗ lớn, nước chảy lênh láng ngay giữa phòng thư viện.",
        image: "https://image2url.com/r2/default/images/1772112692249-dd7fa80a-fcb4-4a09-aae7-17d6ef35048d.jpg",
        choices: [
            { text: "Gọi ngay thợ chống thấm đến trám mái nhà triệt để.", next: "stage_8", effect: { money: -1200000, time: -1 } },
            { text: "Tự mua keo silicon và bạt ni-lông leo thang dán tạm.", next: "stage_8", effect: { money: -200000, time: -2, quality: -15 } },
            { text: "Dời kệ đi chỗ khác, đặt chậu cây để 'Hứng nước tự nhiên'.", next: "stage_8", effect: { money: -400000, time: -2, morale: -10, quality: 20 } }
        ]
    },
    stage_8: {
        theme: "Kiểm soát rác thải, dọn dẹp mặt bằng phát sinh chi phí dọn dẹp.",
        text: "<b>GIAI ĐOẠN 8: KIỂM SOÁT MÔI TRƯỜNG</b><br>Đống rác thải công trình chất cao như núi. Bác lao công trường từ chối dọn.",
        image: "https://image2url.com/r2/default/images/1772112738404-3fe56192-30bd-4eb0-85ec-c737c8ec7c31.jpg",
        choices: [
            { text: "Trả tiền cho đội xe rác chuyên nghiệp dọn sạch sẽ.", next: "stage_9", effect: { money: -600000, quality: 10 }, bgRep: 1 },
            { text: "Mượn xe còng, tự è cổ đẩy rác ra bãi tập kết xa 2km.", next: "stage_9", effect: { time: -2, morale: -20 } },
            { text: "Lén lút dồn rác vào góc kho trống và lấy bạt phủ lên.", next: "stage_9", effect: { morale: -5, quality: -25 }, bgRep: -1,
              delayed: { triggerStage: "stage_10", effect: { morale: -10, quality: -10 }, message: "🗑️ Hậu quả muộn: Mùi hôi từ góc kho rác bốc lên đúng ngày Lễ Khai Giảng, khách mời phàn nàn!" }
            }
        ]
    },
    stage_9: {
        theme: "Đối phó với sự kiểm tra bất ngờ của Ban giám hiệu/Thanh tra.",
        text: "<b>GIAI ĐOẠN 9: ĐỐI NGOẠI</b><br>BGH nhà trường bất ngờ cử Đoàn Thanh Tra xuống xem tiến độ. Phòng ốc vẫn còn lộn xộn.",
        image: "https://image2url.com/r2/default/images/1772112781121-03b3048b-3263-49cd-a8b2-12f647a1de9e.jpg",
        choices: [
            { text: "Mua trái cây, nước ngọt mời Đoàn ra phòng khách, hứa hẹn mai xong.", next: "stage_10", effect: { money: -300000, time: -1, morale: 5, quality: 10 } },
            { text: "Mặc kệ Đoàn thanh tra, cả nhóm vẫn cắm đầu làm.", next: "stage_10", effect: { morale: -10, quality: -15 } },
            { text: "Mặc áo Đoàn, dõng dạc thuyết trình về 'Không gian sáng tạo' để đánh lạc hướng.", next: "stage_10", effect: { time: -1, quality: 15 } }
        ]
    },
    stage_10: {
        theme: "Chạy nước rút, liên hoan và chuẩn bị lễ khánh thành bàn giao.",
        text: "<b>GIAI ĐOẠN 10: BÀN GIAO</b><br>Ngày mai là Lễ Khai Giảng! Bạn chỉ còn đúng một ngày và những nguồn lực cuối cùng.",
        image: "https://image2url.com/r2/default/images/1772113158873-ce999844-b304-476d-93ed-72c1a7d420db.jpg",
        choices: [
            { text: "Khao cả nhóm một bữa lẩu hoành tráng vì những cực khổ đã qua.", next: "calc_ending", effect: { money: -800000, morale: 60 } },
            { text: "Ép mọi người ở lại đến 11h đêm lau chùi từng hạt bụi.", next: "calc_ending", effect: { time: -1, morale: -20, quality: 30 } },
            { text: "Mua những phần quà nhỏ (kẹo, ruy băng) để phát cho học sinh.", next: "calc_ending", effect: { money: -300000, morale: 10, quality: 20 } }
        ]
    },
    gameover_money:  { text: "GAME OVER: VỠ NỢ TÀI CHÍNH 💸", isEnd: true },
    gameover_time:   { text: "GAME OVER: TRỄ DEADLINE ⏱️",    isEnd: true },
    gameover_morale: { text: "GAME OVER: NHÓM TAN RÃ 😡",      isEnd: true },
    end_bad:         { text: "KẾT THÚC: DỰ ÁN TỒI TỆ",        isEnd: true },
    end_normal:      { text: "KẾT THÚC: ĐẠT YÊU CẦU",         isEnd: true },
    end_perfect:     { text: "KẾT THÚC: HUYỀN THOẠI",          isEnd: true }
};

// ══ STATIC EVENTS ══
export const STATIC_EVENTS = [
    // early
    { title: "⛈️ MƯA BÃO!", desc: "Mưa lớn làm gián đoạn công việc ngoài trời. Nhóm buộc nghỉ 1 ngày.", type: "bad", phase: "early", effect: { time: -1, morale: -5 } },
    { title: "💸 MẤT VÍ TIỀN!", desc: "Một thành viên làm rớt ví tiền quỹ. Phải trích bổ sung cho họ.", type: "bad", phase: "early", effect: { money: -300000, morale: -10 } },
    { title: "🌡️ NẮNG KINH HOÀNG", desc: "Trời 40°C, cả nhóm bải hoải, năng suất giảm rõ rệt. Buộc nghỉ sớm.", type: "bad", phase: "early", effect: { time: -1, morale: -8 } },
    { title: "🧋 TÀI TRỢ NƯỚC UỐNG!", desc: "Phụ huynh học sinh mang trà sữa đến tiếp sức. Cả nhóm hừng hực khí thế!", type: "good", phase: "early", effect: { morale: 25, quality: 5 } },
    { title: "🍀 KHO ĐỒ BẤT NGỜ", desc: "Phát hiện kho sách cũ còn rất mới trong kho nhà trường — họ tặng không!", type: "good", phase: "early", effect: { quality: 20, money: 200000 } },
    { title: "🎁 ALUMNI ĐÓNG GÓP", desc: "Cựu học sinh tình cờ đi ngang, hào phóng ủng hộ dự án một khoản tiền mặt!", type: "good", phase: "early", effect: { money: 500000, morale: 10 } },
    // mid
    { title: "⚡ CÚP ĐIỆN ĐỘT XUẤT", desc: "Điện cúp cả buổi chiều. Máy khoan, máy cưa đều ngừng hoạt động.", type: "bad", phase: "mid", effect: { time: -1, morale: -10 } },
    { title: "🔧 DỤNG CỤ HỎNG", desc: "Máy khoan duy nhất của nhóm chập mạch. Phải thuê máy thay thế gấp.", type: "bad", phase: "mid", effect: { money: -200000, time: -1 } },
    { title: "🤧 THÀNH VIÊN ỐM DÂY CHUYỀN", desc: "Hai bạn bị say nắng phải nghỉ bệnh, khối lượng công việc dồn lại.", type: "bad", phase: "mid", effect: { time: -1, morale: -12 } },
    { title: "📢 TRUYỀN THÔNG ỦNG HỘ", desc: "Fanpage địa phương đăng bài về dự án. Nhiều người hỏi thăm và muốn tặng sách!", type: "good", phase: "mid", effect: { quality: 15, morale: 20 } },
    { title: "🏫 PHÒNG MỞ RỘNG", desc: "BGH đồng ý cho mượn thêm phòng kề bên để trưng bày sách thiếu nhi.", type: "good", phase: "mid", effect: { quality: 25, time: -1 } },
    // late
    { title: "🐀 SỰ CỐ KHÔNG MONG ĐỢI", desc: "Phát hiện dấu vết chuột trong góc kho. Phải dọn sạch toàn bộ và mua bẫy.", type: "bad", phase: "late", effect: { money: -150000, morale: -8, quality: -5 } },
    { title: "🚧 KIỂM TRA AN TOÀN PCCC", desc: "Đội phòng cháy chữa cháy kiểm tra đột xuất, yêu cầu khắc phục một số lỗi nhỏ.", type: "bad", phase: "late", effect: { time: -1, money: -100000, quality: 5 } },
    { title: "🎨 HOẠ SĨ TÌNH NGUYỆN", desc: "Một sinh viên mỹ thuật xin phép vẽ mural miễn phí lên tường thư viện. Đẹp kinh ngạc!", type: "good", phase: "late", effect: { quality: 30, morale: 15 } },
    { title: "📱 VIRAL MẠNG XÃ HỘI", desc: "Video thi công được chia sẻ rộng rãi. Nhiều mạnh thường quân liên hệ ủng hộ vật chất.", type: "good", phase: "late", effect: { money: 400000, morale: 20 } }
];

// ══ BONUS OPPORTUNITIES ══
export const BONUS_OPPORTUNITIES = [
    {
        id: 'bonus_tech',
        triggerBeforeStage: 'stage_5',
        icon: '💻', title: 'CƠ HỘI ĐẶC BIỆT!',
        desc: 'Một công ty công nghệ địa phương muốn tài trợ thiết bị số cho thư viện. Đổi lại, nhóm phải tổ chức 1 buổi workshop kỹ năng số cho học sinh — cần thêm 2 ngày và sức lực.',
        costLabel: '⏱️ -2 ngày  |  ❤️ -10% tinh thần',
        accept: { time: -2, morale: -10, quality: 30, money: 500000 },
        labelAccept: '🤝 Nhận lời', labelSkip: '⏭️ Bỏ qua lần này'
    },
    {
        id: 'bonus_media',
        triggerBeforeStage: 'stage_8',
        icon: '📸', title: 'TRUYỀN THÔNG TÌM ĐẾN!',
        desc: 'Một tạp chí thanh niên muốn đến phỏng vấn và chụp phóng sự về dự án. Phòng cần được chỉnh chu thêm một chút trước khi quay.',
        costLabel: '⏱️ -1 ngày  |  💰 -200k chi phí dọn dẹp',
        accept: { time: -1, money: -200000, quality: 20, morale: 15 },
        labelAccept: '📷 Chào đón họ', labelSkip: '🚫 Từ chối'
    }
];

// ══ NHÂN VẬT ══
export const CHARACTER_ROSTER = [
    { name: "Tùng",  icon: "😤", trait: "thực dụng, hay than vãn nhưng làm được việc" },
    { name: "Mai",   icon: "🌸", trait: "nhiệt tình, hay khen ngợi, nhìn nhận tích cực" },
    { name: "Khoa",  icon: "🤔", trait: "cẩn thận, lo xa, hay phân tích chi phí rủi ro" },
    { name: "Linh",  icon: "💙", trait: "nhạy cảm, quan tâm tinh thần đồng đội" }
];

// ══ HỘI ĐỒNG PHÁN XÉT ══
export const JUDGES = [
    { name: 'Phụ Huynh Học Sinh', icon: '👨‍👩‍👧', focus: 'chất lượng thư viện và an toàn cho học sinh', metric: 'quality' },
    { name: 'Kế Toán Trường',     icon: '📊',       focus: 'quản lý tài chính và hiệu quả chi tiêu',       metric: 'money'  },
    { name: 'Cô Giáo Chủ Nhiệm', icon: '👩‍🏫',       focus: 'tinh thần và sự đoàn kết của nhóm tình nguyện', metric: 'morale' }
];

// ══ ORACLE HINTS ══
export const ORACLE_POOL = [
    { icon: '🌩️', text: 'Có điều gì đó không ổn với tiến độ hôm nay.' },
    { icon: '💡', text: 'Đôi khi giải pháp rẻ nhất lại tốn kém nhất về lâu dài.' },
    { icon: '🤝', text: 'Một người bên ngoài có thể giúp bạn hơn bạn nghĩ.' },
    { icon: '⚖️', text: 'Cân bằng giữa tốc độ và chất lượng — hôm nay bạn chọn gì?' },
    { icon: '🌊', text: 'Mùa mưa đến sớm hơn mọi năm.' },
    { icon: '🔍', text: 'Ai đó đang chú ý đến cách làm việc của nhóm.' },
    { icon: '💸', text: 'Khoa lo lắng về con số trong sổ quỹ.' },
    { icon: '🌸', text: 'Mai nói hôm nay cô ấy "cảm thấy vận may đang đến".' },
    { icon: '⚡', text: 'Buổi chiều hôm qua có sét đánh gần đây.' },
    { icon: '📦', text: 'Có người giao một kiện hàng không ai đặt.' },
    { icon: '🎲', text: 'Linh bảo: "Liều một cái xem sao!"' }
];

// ══ STAGE ICONS (cho album ký ức) ══
export const STAGE_ICONS = ['🏗️','📚','🚛','🤒','😤','🔍','🌧️','🗑️','📋','🎉'];

// ══ HALFTIME QUOTES ══
export const HALFTIME_QUOTES = [
    '"Người quản lý giỏi không phải người không bao giờ sai, mà là người học được từ sai lầm."',
    '"Nguồn lực hữu hạn, nhưng sự sáng tạo thì vô hạn."',
    '"Một tập thể đoàn kết có thể vượt qua bất kỳ khó khăn nào."',
    '"Khi áp lực tăng, bản lĩnh của người lãnh đạo mới thực sự được thể hiện."'
];

// ══ END SCREEN CONFIGS ══
export const END_CONFIGS = {
    gameover_money:  { badge: "💸", title: "VỠ NỢ TÀI CHÍNH",        subtitle: "Quỹ dự án về 0. Tất cả mọi thứ dừng lại.", color: "var(--danger)", image: "" },
    gameover_time:   { badge: "⏱️", title: "TRỄ DEADLINE",            subtitle: "Không kịp Lễ Khai Giảng. Dự án bị hủy bỏ.", color: "var(--danger)", image: "" },
    gameover_morale: { badge: "😡", title: "NHÓM TAN RÃ",              subtitle: "Tinh thần kiệt sức. Các thành viên tự rời đi.", color: "var(--danger)", image: "" },
    end_bad:         { badge: "🏚️", title: "DỰ ÁN TỒI TỆ",           subtitle: "Đúng hạn, đúng tiền, nhưng thư viện rách nát. Các lối tắt đều phải trả giá.", color: "var(--danger)", image: "" },
    end_normal:      { badge: "👍", title: "HOÀN THÀNH ĐẠT YÊU CẦU",  subtitle: "An toàn. Đủ để ghi nhận nỗ lực chân thành của tập thể.", color: "var(--warning)", image: "" },
    end_perfect:     { badge: "🏆", title: "HUYỀN THOẠI MÙA HÈ XANH", subtitle: "Tài chính minh bạch, đúng tiến độ, thư viện tuyệt đẹp. Tên bạn sẽ được nhớ mãi!", color: "var(--gold)", image: "https://image2url.com/r2/default/images/1772112817266-5f9fc691-f09e-4873-abc7-9442385c9f6b.jpg" }
};

// ══ LEADERBOARD ══
export const LB_KEY = 'mhx_lb_v4';
export const NG_KEY = 'mhx_ng_unlocked';
export const ENDING_LABELS = {
    gameover_money:'💸 Vỡ nợ', gameover_time:'⏱️ Trễ deadline',
    gameover_morale:'😡 Tan rã', end_bad:'🏚️ Tồi tệ',
    end_normal:'👍 Đạt yêu cầu', end_perfect:'🏆 Huyền thoại'
};
export const DIFF_LABELS = { normal:'🌱', expert:'⚔️', asian:'🔥' };

// ══ ADMIN PASSWORD ══
export const ADMIN_PASSWORD = "181008";

// ════════════════════════════════════════════════════════
//  NÂNG CẤP 1: DECISION FLAGS
//  Mỗi lựa chọn quan trọng gắn 1 flag vào decisionFlags.
//  Dùng để: routing nhánh, điều kiện secret ending, judge verdict context.
// ════════════════════════════════════════════════════════

export const FLAG_DEFINITIONS = {
    // Flag về phong cách lãnh đạo
    disciplined:  'Xử lý kỷ luật cứng rắn trước đám đông',
    empathetic:   'Giải quyết xung đột bằng thấu hiểu cá nhân',
    avoidant:     'Né tránh xung đột, tự gánh vác thay vì đối mặt',
    // Flag về quyết định tài chính
    investor:     'Sẵn sàng chi lớn để đảm bảo chất lượng',
    frugal:       'Ưu tiên tiết kiệm tối đa, chấp nhận đánh đổi',
    resourceful:  'Huy động nguồn lực bên ngoài thay vì tự làm hoặc mua',
    // Flag về đạo đức / trách nhiệm
    transparent:  'Xử lý vấn đề minh bạch, đúng quy trình',
    shortcut:     'Chọn giải pháp tắt, bỏ qua quy trình đúng',
    reckless:     'Mặc kệ hậu quả, ưu tiên tiện lợi trước mắt',
    // Flag về ngoại giao
    diplomatic:   'Giải quyết áp lực bên ngoài bằng khéo léo và quan hệ',
    stubborn:     'Phớt lờ áp lực ngoài, cắm đầu làm theo kế hoạch',
    creative:     'Dùng sáng tạo để biến tình huống tiêu cực thành tích cực'
};

// ════════════════════════════════════════════════════════
//  NÂNG CẤP 2: TRUST WEIGHTS
//  Mỗi lựa chọn ảnh hưởng trust của từng nhân vật khác nhau.
//  trust range: 0–100. Base: tung=50, mai=60, khoa=55, linh=60
//
//  Tùng: tin nếu bạn thực dụng, mạnh mẽ; không tin nếu bạn lý tưởng
//  Mai:  tin nếu bạn tử tế, quan tâm đồng đội; không tin nếu bạn cục cằn
//  Khoa: tin nếu bạn chi tiêu hợp lý, có kế hoạch; không tin nếu phung phí/cẩu thả
//  Linh: tin nếu bạn lắng nghe cảm xúc; không tin nếu bạn áp bức/né tránh
// ════════════════════════════════════════════════════════

// key: flag của lựa chọn → trustDelta cho từng nhân vật
export const TRUST_BY_FLAG = {
    disciplined: { tung: +12, mai: -10, khoa: +5,  linh: -15 },
    empathetic:  { tung: +20, mai: +15, khoa: +5,  linh: +18 },
    avoidant:    { tung: +5,  mai: -5,  khoa: -8,  linh: -12 },
    investor:    { tung: +5,  mai: +8,  khoa: -10, linh: +5  },
    frugal:      { tung: +10, mai: -5,  khoa: +15, linh: -5  },
    resourceful: { tung: -5,  mai: +10, khoa: +8,  linh: +10 },
    transparent: { tung: -5,  mai: +12, khoa: +15, linh: +12 },
    shortcut:    { tung: +8,  mai: -8,  khoa: -12, linh: -10 },
    reckless:    { tung: +12, mai: -15, khoa: -18, linh: -15 },
    diplomatic:  { tung: -8,  mai: +10, khoa: +5,  linh: +8  },
    stubborn:    { tung: +10, mai: -10, khoa: +5,  linh: -8  },
    creative:    { tung: -5,  mai: +15, khoa: +5,  linh: +12 }
};

// ════════════════════════════════════════════════════════
//  NÂNG CẤP 1: BRANCHING STAGES
//  stage_5 sẽ route sang branch_5_resolve (handled trong game.js)
//  → Track A (morale cao, empathetic flag): stage_6a - Đoàn Kết
//  → Track B (morale thấp, disciplined/avoidant): stage_6b - Khủng Hoảng
//  Cả hai track hội tụ tại stage_7.
// ════════════════════════════════════════════════════════

export const BRANCH_STAGES = {
    stage_6a: {
        branch: 'A',
        theme: "Nhóm đoàn kết, tận dụng sự sáng tạo tập thể để giải quyết thiếu hụt tài nguyên.",
        text: "<b>GIAI ĐOẠN 6A: SỨC MẠNH TẬP THỂ</b><br>Nhóm đang làm việc hiệu quả hơn sau khi xử lý mâu thuẫn. Nhưng một vấn đề mới nổi lên: nguồn sách quyên góp có chất lượng không đồng đều. Tùng đề xuất một cách lọc sách sáng tạo bằng cách huy động học sinh trong trường.",
        image: "https://image2url.com/r2/default/images/1772112657879-d997f6ed-2c44-42a0-8468-2565dab08eac.jpg",
        choices: [
            {
                text: "Cho phép Tùng tổ chức buổi 'Hội đồng Sách' — học sinh tự bình chọn sách hay/dở.",
                next: "stage_7",
                flag: 'empathetic',
                effect: { time: -2, morale: 20, quality: 20 },
                trustDelta: { tung: +15, mai: +10, khoa: 0, linh: +10 }
            },
            {
                text: "Tự nhóm lọc theo tiêu chí chuẩn, không cần học sinh tham gia cho nhanh.",
                next: "stage_7",
                flag: 'disciplined',
                effect: { time: -1, morale: -5, quality: 15 },
                trustDelta: { tung: +5, mai: -5, khoa: +8, linh: -5 }
            },
            {
                text: "Liên hệ thư viện trường xin danh sách sách tiêu chuẩn để đối chiếu.",
                next: "stage_7",
                flag: 'resourceful',
                effect: { time: -1, morale: 5, quality: 25 },
                trustDelta: { tung: -5, mai: +8, khoa: +12, linh: +5 }
            }
        ]
    },

    stage_6b: {
        branch: 'B',
        theme: "Nhóm rạn nứt sau mâu thuẫn chưa được giải quyết triệt để, cần xử lý khủng hoảng nội bộ.",
        text: "<b>GIAI ĐOẠN 6B: KHỦNG HOẢNG NỘI BỘ</b><br>Không khí trong nhóm nặng nề. Sau vụ Tùng, một số thành viên bắt đầu đến trễ và làm ít hơn mà không nói gì. Mai nhắn tin riêng: <i>\"Bạn ơi, nhóm đang có vấn đề rồi. Em thấy mọi người mất hứng lắm.\"</i><br><br>Bạn cần hành động ngay trước khi dự án sụp đổ từ bên trong.",
        image: "https://image2url.com/r2/default/images/1772112558986-3662e854-5f1e-465c-a343-7ffae1569ffb.jpg",
        choices: [
            {
                text: "Họp khẩn toàn nhóm, thẳng thắn xin lỗi về cách xử lý vừa rồi và lắng nghe.",
                next: "stage_7",
                flag: 'transparent',
                effect: { time: -2, morale: 30, quality: 0 },
                trustDelta: { tung: +20, mai: +20, khoa: +15, linh: +25 },
                bgRep: 1
            },
            {
                text: "Phân công lại công việc ngay — không cần họp, cần hành động.",
                next: "stage_7",
                flag: 'stubborn',
                effect: { time: -1, morale: -10, quality: 10 },
                trustDelta: { tung: +5, mai: -10, khoa: +5, linh: -15 }
            },
            {
                text: "Nhờ Mai — người được cả nhóm tin tưởng — làm trung gian hòa giải.",
                next: "stage_7",
                flag: 'diplomatic',
                effect: { time: -1, morale: 15, quality: 5 },
                trustDelta: { tung: +10, mai: +5, khoa: +5, linh: +10 }
            }
        ]
    }
};

// Condition để vào track A hay B — gọi từ game.js
// Input: { morale, flags (Set) }
export function resolveBranch({ morale, flags }) {
    const isEmpathetic = flags.has('empathetic');
    const isDisciplined = flags.has('disciplined');
    // Track A: đã thể hiện sự đồng cảm, HOẶC tinh thần tốt và không quá cứng nhắc
    if (isEmpathetic || (morale > 65 && !isDisciplined)) return 'stage_6a';
    return 'stage_6b';
}

// ════════════════════════════════════════════════════════
//  NÂNG CẤP 3: EXPANDED ENDING MATRIX
//  6 endings thường + 2 secret endings
//
//  Regular matrix (quality × morale final):
//   quality < bad                          → end_bad
//   quality ≥ bad, morale < 40            → end_hollow   (chất lượng đạt nhưng nhóm kiệt sức)
//   quality ≥ bad, morale ≥ 40            → end_normal
//   quality ≥ good, morale < 50           → end_perfectionists (thư viện đẹp, nhóm sứt mẻ)
//   quality ≥ good, morale ≥ 50           → end_perfect
//   quality ≥ good + morale ≥ 75 + Track A → end_legend (phiên bản siêu cấp)
//
//  Secret endings (kiểm tra TRƯỚC regular):
//   CLEAN_RUN: không có shortcut/reckless/avoidant → end_secret_clean
//   TUNG_REDEEMED: trust.tung > 82 + empathetic flag → end_secret_tung
// ════════════════════════════════════════════════════════

export const SECRET_ENDING_CONDITIONS = [
    {
        id: 'end_secret_clean',
        label: 'Lương Tâm Trong Sáng',
        // Không có flag nào là shortcut, reckless, avoidant
        // AND quality đủ để normal ending
        check: ({ flags, quality, diffQualityBad }) =>
            !flags.has('shortcut') && !flags.has('reckless') && !flags.has('avoidant')
            && quality >= diffQualityBad
    },
    {
        id: 'end_secret_tung',
        label: 'Kẻ Thù Thành Người Anh Em',
        // Tùng trust > 82 + đã có flag empathetic
        check: ({ flags, trustTung }) =>
            flags.has('empathetic') && trustTung > 82
    }
];

// END CONFIGS mở rộng — ghi đè/mở rộng END_CONFIGS gốc
export const END_CONFIGS_V2 = {
    gameover_money:  { badge:"💸", title:"VỠ NỢ TÀI CHÍNH",         subtitle:"Quỹ dự án về 0. Tất cả mọi thứ dừng lại.", color:"var(--danger)", image:"", trackLabel:null },
    gameover_time:   { badge:"⏱️", title:"TRỄ DEADLINE",             subtitle:"Không kịp Lễ Khai Giảng. Dự án bị hủy bỏ.", color:"var(--danger)", image:"", trackLabel:null },
    gameover_morale: { badge:"😡", title:"NHÓM TAN RÃ",               subtitle:"Tinh thần kiệt sức. Các thành viên tự rời đi.", color:"var(--danger)", image:"", trackLabel:null },

    end_bad:            { badge:"🏚️", title:"DỰ ÁN TỒI TỆ",          subtitle:"Đúng hạn, đúng tiền, nhưng thư viện rách nát. Những lối tắt đều phải trả giá.", color:"var(--danger)", image:"", trackLabel:null },
    end_hollow:         { badge:"🥀", title:"CHIẾN THẮNG RỖNG TUẾCH", subtitle:"Thư viện đủ tiêu chuẩn, nhưng nhóm tan vỡ. Ai cũng mệt, không ai vui. Bạn đã thắng trận, thua cả chiến dịch.", color:"var(--danger)", image:"", trackLabel:"⚠️ Kết quả Track Khủng Hoảng" },
    end_normal:         { badge:"👍", title:"HOÀN THÀNH ĐẠT YÊU CẦU", subtitle:"An toàn. Đủ để ghi nhận nỗ lực chân thành của tập thể.", color:"var(--warning)", image:"", trackLabel:null },
    end_perfectionists: { badge:"🔥", title:"HOÀN HẢO, NHƯNG ĐẮT GIÁ", subtitle:"Thư viện đẹp như mơ. Nhưng nhìn lại: bao nhiêu người đã bị hi sinh trên đường đến đây?", color:"var(--warning)", image:"", trackLabel:"⚡ Kết quả Perfectionist" },
    end_perfect:        { badge:"🏆", title:"HUYỀN THOẠI MÙA HÈ XANH", subtitle:"Tài chính minh bạch, đúng tiến độ, thư viện tuyệt đẹp, nhóm đoàn kết. Tên bạn sẽ được nhớ mãi!", color:"var(--gold)", image:"https://image2url.com/r2/default/images/1772112817266-5f9fc691-f09e-4873-abc7-9442385c9f6b.jpg", trackLabel:"✨ Kết quả Track Đoàn Kết" },
    end_legend:         { badge:"⭐", title:"TRUYỀN THUYẾT SỐNG",       subtitle:"Không chỉ hoàn thành xuất sắc — bạn đã tạo ra một tập thể thực sự. Dự án năm sau, BGH mời bạn làm cố vấn.", color:"var(--gold)", image:"https://image2url.com/r2/default/images/1772112817266-5f9fc691-f09e-4873-abc7-9442385c9f6b.jpg", trackLabel:"🌟 Track A — Đỉnh Cao" },

    // Secret endings
    end_secret_clean: {
        badge:"💎", title:"LƯƠNG TÂM TRONG SÁNG",
        subtitle:"Bạn không chọn một lối tắt nào trong suốt hành trình. Điều đó hiếm đến mức đáng được ghi vào sử sách của dự án.",
        color:"#22D3EE", image:"", trackLabel:"🔓 Secret Ending #1",
        secretHint:"Còn 1 Secret Ending nữa. Gợi ý: Một kẻ thù có thể trở thành đồng minh tốt nhất của bạn."
    },
    end_secret_tung:  {
        badge:"🤝", title:"KẺ THÙ THÀNH NGƯỜI ANH EM",
        subtitle:"Tùng — người bạn gần như xung đột — giờ là người trung thành nhất trong nhóm. Anh ấy tình nguyện làm thêm không công trong 3 ngày cuối. Đây là ending không ai nghĩ có thể xảy ra.",
        color:"#F0D060", image:"", trackLabel:"🔓 Secret Ending #2",
        secretHint:"Bạn đã khám phá cả 2 Secret Endings. Bạn thực sự hiểu Dự Án Mùa Hè Xanh."
    }
};

// Updated ENDING_LABELS để include endings mới
export const ENDING_LABELS_V2 = {
    gameover_money:'💸 Vỡ nợ', gameover_time:'⏱️ Trễ deadline',
    gameover_morale:'😡 Tan rã', end_bad:'🏚️ Tồi tệ',
    end_hollow:'🥀 Chiến thắng rỗng', end_normal:'👍 Đạt yêu cầu',
    end_perfectionists:'🔥 Hoàn hảo nhưng đắt', end_perfect:'🏆 Huyền thoại',
    end_legend:'⭐ Truyền thuyết', end_secret_clean:'💎 Lương tâm trong sáng',
    end_secret_tung:'🤝 Kẻ thù thành anh em'
};

// ════════════════════════════════════════════════════════
//  STORY CHOICE FLAGS & TRUST DELTAS
//  Mảng song song với STORY — gắn flag + trustDelta cho từng lựa chọn.
//  Index tương ứng với choices[0], choices[1], choices[2]
// ════════════════════════════════════════════════════════

export const CHOICE_META = {
    start: [
        { flag: 'investor',    trustDelta: { tung: +5,  mai: +5,  khoa: -8, linh: +5  } },
        { flag: 'frugal',      trustDelta: { tung: +8,  mai: -8,  khoa: +12, linh: -8 } },
        { flag: 'resourceful', trustDelta: { tung: -5,  mai: +10, khoa: +8, linh: +8  } }
    ],
    stage_2: [
        { flag: 'investor',    trustDelta: { tung: +5,  mai: +5,  khoa: -10, linh: +5  } },
        { flag: 'resourceful', trustDelta: { tung: -5,  mai: +10, khoa: +5,  linh: +10 } },
        { flag: 'diplomatic',  trustDelta: { tung: -8,  mai: +12, khoa: +8,  linh: +8  } }
    ],
    stage_3: [
        { flag: 'investor',    trustDelta: { tung: +5,  mai: +5,  khoa: -8,  linh: +5  } },
        { flag: 'frugal',      trustDelta: { tung: +5,  mai: -5,  khoa: +10, linh: -5  } },
        { flag: 'frugal',      trustDelta: { tung: +8,  mai: -8,  khoa: +8,  linh: -12 } }
    ],
    stage_4: [
        { flag: 'investor',    trustDelta: { tung: +8,  mai: +8,  khoa: -12, linh: +8  } },
        { flag: 'reckless',    trustDelta: { tung: +5,  mai: -15, khoa: -5,  linh: -18 } },
        { flag: 'avoidant',    trustDelta: { tung: +5,  mai: 0,   khoa: -5,  linh: -8  } }
    ],
    stage_5: [
        { flag: 'disciplined', trustDelta: { tung: -20, mai: -10, khoa: +5,  linh: -15 } },
        { flag: 'empathetic',  trustDelta: { tung: +25, mai: +15, khoa: +5,  linh: +18 } },
        { flag: 'avoidant',    trustDelta: { tung: +5,  mai: -5,  khoa: -10, linh: -12 } }
    ],
    stage_7: [
        { flag: 'investor',    trustDelta: { tung: +5,  mai: +5,  khoa: -8,  linh: +5  } },
        { flag: 'frugal',      trustDelta: { tung: +8,  mai: -5,  khoa: +8,  linh: -8  } },
        { flag: 'creative',    trustDelta: { tung: -5,  mai: +12, khoa: +5,  linh: +10 } }
    ],
    stage_8: [
        { flag: 'transparent', trustDelta: { tung: -5,  mai: +10, khoa: +12, linh: +10 } },
        { flag: 'frugal',      trustDelta: { tung: +8,  mai: -8,  khoa: +5,  linh: -10 } },
        { flag: 'shortcut',    trustDelta: { tung: +10, mai: -12, khoa: -15, linh: -12 } }
    ],
    stage_9: [
        { flag: 'diplomatic',  trustDelta: { tung: -5,  mai: +8,  khoa: +5,  linh: +8  } },
        { flag: 'stubborn',    trustDelta: { tung: +8,  mai: -10, khoa: +5,  linh: -8  } },
        { flag: 'creative',    trustDelta: { tung: -5,  mai: +12, khoa: +8,  linh: +10 } }
    ],
    stage_10: [
        { flag: 'empathetic',  trustDelta: { tung: +10, mai: +12, khoa: -8,  linh: +12 } },
        { flag: 'disciplined', trustDelta: { tung: +5,  mai: -8,  khoa: +10, linh: -10 } },
        { flag: 'diplomatic',  trustDelta: { tung: 0,   mai: +8,  khoa: +5,  linh: +8  } }
    ]
};
