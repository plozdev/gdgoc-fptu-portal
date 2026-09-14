import { Department, LeadRole, EventItem, StatMilestone, OrganizerMember } from '../types';

export const CHAPTER_INFO = {
  name: "Google Developer Groups on Campus FPT University HCMC",
  shortName: "GDG on Campus FPTU HCMC",
  acronym: "GDGoC FPTU HCMC",
  term: "Kỳ Fall 2026",
  recruitmentBatch: "Gen 4.0",
  slogan: "Take Target Together",
  hashtag: "#GDGOnCampus",
  university: "FPT University HCMC",
  campusLocation: "Đường D9, Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh",
  email: "gdgoc.fptuhcmc@gmail.com",
  establishedYear: 2021,
  disclaimer: "Google Developer Groups on Campus is an independent group; our activities and the opinions expressed here should in no way be linked to Google, the corporation.",
  summerAward: '"The GDGoC Impact Maker" trong AI Riser Vietnam 2026',
};

export const DEPARTMENTS_DATA: Department[] = [
  // --- KHỐI TECH ---
  {
    id: "tech-ai",
    name: "AI",
    vietnameseName: "Ban Trí Tuệ Nhân Tạo",
    division: "TECH",
    coreColor: "#FBBC04", // Google Yellow
    pastelColor: "#FFE7A5",
    halftoneColor: "#FFD427",
    textColor: "#1E1E1E",
    iconName: "BrainCircuit",
    shortDesc: "Nghiên cứu GenAI, Gemini API, Vertex AI, RAG.",
    skills: ["GenAI", "Gemini API", "Vertex AI", "RAG Pipeline", "Vector DBs", "Python", "LangChain"],
    jd: {
      overview: "Tập trung nghiên cứu và ứng dụng các công nghệ AI tiên phong của Google như mô hình Gemini 1.5/2.0 Flash/Pro, Vertex AI, và kỹ thuật Retrieval Augmented Generation (RAG).",
      responsibilities: [
        "Nghiên cứu sâu các API và công cụ AI mới nhất từ Google (Gemini API, Google AI Studio, Vertex AI).",
        "Xây dựng các prototype ứng dụng GenAI và trợ lý ảo thông minh phục vụ cộng đồng sinh viên FPTU.",
        "Thiết kế tài liệu thực hành, codelab và đứng lớp hướng dẫn chuỗi workshop Build & Share Series.",
        "Tham gia thi đấu các giải đấu AI quốc gia và hỗ trợ dự án thi Google Solution Challenge."
      ],
      requirements: [
        "Nắm vững lập trình Python cơ bản/nâng cao và tư duy thuật toán.",
        "Hiểu biết hoặc có hứng thú đặc biệt với LLM, Prompt Engineering, API integration.",
        "Tinh thần chủ động tìm hiểu tài liệu kỹ thuật tiếng Anh và chia sẻ kiến thức.",
        "Ưu tiên sinh viên đã từng thử nghiệm với Google AI Studio hoặc các thư viện Machine Learning."
      ],
      benefits: [
        "Tiếp cận tài nguyên Google AI & Gemini API credits phục vụ nghiên cứu và phát triển sản phẩm.",
        "Được mentor trực tiếp bởi các anh/chị sinh viên đạt giải cao tại AI Riser Vietnam 2026.",
        "Xây dựng portfolio dự án AI thực chiến để apply học bổng hoặc kỳ thực nghiệp OJT."
      ]
    }
  },
  {
    id: "tech-cloud",
    name: "Cloud",
    vietnameseName: "Ban Điện Toán Đám Mây",
    division: "TECH",
    coreColor: "#4285F4", // Google Blue
    pastelColor: "#C3ECF6",
    halftoneColor: "#57CAFF",
    textColor: "#1E1E1E",
    iconName: "Cloud",
    shortDesc: "Quản lý hạ tầng GCP, Docker, CI/CD, phong trào Google Cloud Skills Boost.",
    skills: ["Google Cloud Platform (GCP)", "Docker", "CI/CD", "Cloud Run", "Cloud Skills Boost", "Kubernetes", "Microservices"],
    jd: {
      overview: "Phụ trách hạ tầng đám mây cho toàn bộ các sản phẩm kỹ thuật của GDGoC FPTU HCMC, đồng thời là đầu tàu lan tỏa văn hóa học tập Google Cloud Skills Boost trên toàn trường.",
      responsibilities: [
        "Quản lý, cấp phát và tối ưu hạ tầng máy chủ, cơ sở dữ liệu trên GCP (Cloud Run, Cloud SQL, Firestore).",
        "Thiết lập và duy trì luồng tự động hóa CI/CD cho các website sự kiện và API nội bộ.",
        "Tổ chức và điều phối giải đấu 'Google Cloud Skills Boost Challenge' cho sinh viên toàn trường FPTU.",
        "Hướng dẫn thành viên đạt các chứng chỉ quốc tế của Google (Cloud Digital Leader, Associate Cloud Engineer)."
      ],
      requirements: [
        "Hiểu kiến thức nền tảng về hệ điều hành Linux, Networking cơ bản và containerization (Docker).",
        "Có kiến thức hoặc mong muốn làm chủ các dịch vụ cốt lõi của Google Cloud Platform.",
        "Cẩn thận, tỉ mỉ với cấu hình bảo mật hạ tầng và chi phí tài nguyên cloud.",
        "Sẵn sàng hỗ trợ các thành viên khác khi deploy sản phẩm lên production."
      ],
      benefits: [
        "Nhận tài trợ tài khoản thực hành Google Cloud Skills Boost miễn phí không giới hạn credits.",
        "Kinh nghiệm quản trị hệ thống cloud thực tế, làm đẹp CV kỹ sư DevOps/Cloud Engineer.",
        "Cơ hội được đề cử nhận voucher thi chứng chỉ Google Cloud chính thức."
      ]
    }
  },
  {
    id: "tech-web",
    name: "Web Development",
    vietnameseName: "Ban Phát Triển Web",
    division: "TECH",
    coreColor: "#34A853", // Google Green
    pastelColor: "#CCF6C5",
    halftoneColor: "#5CDB6D",
    textColor: "#1E1E1E",
    iconName: "Code2",
    shortDesc: "Phát triển website sự kiện, landing page, Git workflow, Fullstack.",
    skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Node.js / Express", "Git & GitHub Workflow", "RESTful API", "Fullstack"],
    jd: {
      overview: "Xây dựng các sản phẩm số của câu lạc bộ, từ landing page tuyển sinh, cổng đăng ký vé sự kiện Google I/O Extended, đến hệ thống check-in tự động cho hàng trăm sinh viên.",
      responsibilities: [
        "Phát triển giao diện web hiện đại (Responsive, Pixel-perfect, Neo-brutalism) theo chuẩn Google Brand.",
        "Xây dựng hệ thống backend, RESTful API và cơ sở dữ liệu xử lý hàng trăm lượt truy cập đồng thời.",
        "Tuân thủ chuẩn mực Git workflow (Branching, Pull Request review, Semantic commit).",
        "Tham gia tối ưu hóa hiệu năng web (SEO, Core Web Vitals, accessibility)."
      ],
      requirements: [
        "Nắm chắc HTML5, CSS3, JavaScript/TypeScript hiện đại.",
        "Có kinh nghiệm làm việc với React (hoặc Next.js) và Tailwind CSS.",
        "Sử dụng thành thạo Git/GitHub để phối hợp nhóm.",
        "Có tinh thần thẩm mỹ cao, tôn trọng trải nghiệm người dùng và chất lượng mã nguồn."
      ],
      benefits: [
        "Code sản phẩm thật được hàng nghìn sinh viên và khách mời sử dụng thực tế.",
        "Luyện tập quy trình làm phần mềm chuẩn doanh nghiệp (Agile/Scrum, Code Review).",
        "Chứng nhận đóng góp mã nguồn mở trong các repository chính thức của GDGoC."
      ]
    }
  },
  {
    id: "tech-research",
    name: "Research",
    vietnameseName: "Ban Nghiên Cứu & Dự Án Học Thuật",
    division: "TECH",
    coreColor: "#EA4335", // Google Red
    pastelColor: "#F8D8D8",
    halftoneColor: "#FF7DAF",
    textColor: "#1E1E1E",
    iconName: "GraduationCap",
    shortDesc: "Nghiên cứu khoa học, xử lý dữ liệu, viết bài báo học thuật cùng giảng viên.",
    skills: ["Nghiên cứu khoa học", "Data Analysis", "Academic Paper Writing", "LaTeX", "Dự án Giảng viên FPTU", "AI / IoT / Systems"],
    jd: {
      overview: "Cầu nối trực tiếp giữa câu lạc bộ và các thầy cô giảng viên, phòng nghiên cứu tại Đại học FPT TP.HCM. Định hướng thực hiện các đề tài nghiên cứu khoa học sinh viên và xuất bản bài báo chuyên ngành.",
      responsibilities: [
        "Tham gia các đề tài nghiên cứu công nghệ chuyên sâu cùng giảng viên chuyên ngành tại trường.",
        "Thu thập, tiền xử lý và phân tích tập dữ liệu lớn phục vụ thực nghiệm khoa học.",
        "Soạn thảo nội dung bài báo khoa học bằng tiếng Anh chuẩn IEEE/ACM bằng công cụ LaTeX.",
        "Đại diện tham gia các hội nghị nghiên cứu sinh viên (FPT Edu Research Festival, ResFes)."
      ],
      requirements: [
        "Học lực khá/giỏi, đặc biệt yêu thích nghiên cứu hàn lâm và đọc các công bố khoa học (papers).",
        "Khả năng tiếng Anh đọc - viết chuyên ngành tốt.",
        "Kiên nhẫn, trung thực trong nghiên cứu và có tư duy phản biện khoa học sắc bén.",
        "Biết sử dụng Python để xử lý dữ liệu hoặc mong muốn học hỏi bài bản."
      ],
      benefits: [
        "Được đứng tên đồng tác giả trong các bài báo khoa học công bố tại hội nghị/tạp chí uy tín.",
        "Điểm cộng lớn khi làm đồ án tốt nghiệp sớm hoặc xin học bổng du học Thạc sĩ / Tiến sĩ.",
        "Mối quan hệ thân thiết và sự dẫn dắt trực tiếp từ các giảng viên đầu ngành của FPTU."
      ]
    }
  },

  // --- KHỐI NON-TECH ---
  {
    id: "nontech-media",
    name: "Media",
    vietnameseName: "Ban Truyền Thông & Thiết Kế",
    division: "NON-TECH",
    coreColor: "#FF7DAF", // Accent Pink/Red
    pastelColor: "#FCE7F3",
    halftoneColor: "#F472B6",
    textColor: "#1E1E1E",
    iconName: "Palette",
    shortDesc: "Thiết kế ấn phẩm 2D/3D theo Google Brand Guideline, video recap, visual stage.",
    skills: ["Google Brand Guideline", "Design 2D/3D", "Figma / Photoshop / Illustrator", "Video Editing / Premiere / CapCut", "Motion Graphics", "Stage Visuals"],
    jd: {
      overview: "Bộ mặt thương hiệu thị giác của GDGoC FPTU HCMC. Chịu trách nhiệm sáng tạo toàn bộ key visual, ấn phẩm social media, visual sân khấu led và video recap cho các sự kiện tầm cỡ.",
      responsibilities: [
        "Thiết kế poster, banner, avatar frame, standee và bộ nhận diện theo đúng Google Brand Guidelines.",
        "Sản xuất motion graphic, trailer và video recap sinh động ghi lại dấu ấn sự kiện.",
        "Phối hợp với Ban Web để thống nhất style UI/UX neo-brutalism và visual assets.",
        "Chụp ảnh, quay tư liệu và quản lý kho tài nguyên truyền thông cho câu lạc bộ."
      ],
      requirements: [
        "Sử dụng tốt ít nhất một phần mềm thiết kế (Figma, Photoshop, Illustrator) hoặc phần mềm dựng phim.",
        "Có tư duy thẩm mỹ hiện đại, nhạy bén với xu hướng thị giác và cách phối màu thương hiệu.",
        "Có trách nhiệm với deadline và sẵn sàng tiếp nhận đóng góp để hoàn thiện sản phẩm.",
        "Gửi kèm Portfolio/Behance/Drive các sản phẩm đã từng thực hiện (nếu có)."
      ],
      benefits: [
        "Thực chiến với bộ quy chuẩn thương hiệu nghiêm ngặt toàn cầu của Google (Google Brand).",
        "Ấn phẩm thiết kế tiếp cận trực tiếp hàng chục nghìn lượt xem trên mạng xã hội và màn LED hội trường.",
        "Xây dựng portfolio thiết kế đa phương tiện cực kỳ chuyên nghiệp và ấn tượng."
      ]
    }
  },
  {
    id: "nontech-hr-event",
    name: "HR & Event",
    vietnameseName: "Ban Nhân Sự & Tổ Chức Sự Kiện",
    division: "NON-TECH",
    coreColor: "#34A853", // Green
    pastelColor: "#CCF6C5",
    halftoneColor: "#5CDB6D",
    textColor: "#1E1E1E",
    iconName: "CalendarCheck",
    shortDesc: "Lập kế hoạch sự kiện (Hackathon, I/O Extended), điều phối logistics và gắn kết văn hóa nội bộ.",
    skills: ["Event Planning", "Hackathon & I/O Extended Ops", "Logistics Coordination", "Văn Hóa Nội Bộ", "Team Bonding", "MC & Host", "Đối Ngoại"],
    jd: {
      overview: "Trái tim vận hành của câu lạc bộ. Đảm nhận từ khâu lên ý tưởng, kịch bản, chạy timeline sự kiện thực tế, cho đến chăm sóc thành viên, gắn kết văn hóa nội bộ nhiệt huyết.",
      responsibilities: [
        "Lập kế hoạch chi tiết, phân công nhân sự và điều phối hậu cần (logistics) cho các sự kiện lớn.",
        "Điều phối hội trường, âm thanh ánh sáng, teabreak và đón tiếp diễn giả, Google Developer Experts.",
        "Tổ chức các hoạt động nội bộ (Team Building, sinh nhật thành viên, Year-End Party, Check-in).",
        "Đánh giá hiệu quả công việc (KPIs), quản lý danh sách thành viên và ghi nhận đóng góp tích cực."
      ],
      requirements: [
        "Năng động, cởi mở, có kỹ năng giao tiếp và truyền năng lượng tích cực cho tập thể.",
        "Khả năng tổ chức, quản lý thời gian và xử lý tình huống phát sinh linh hoạt.",
        "Tỉ mỉ, có trách nhiệm cao với các công việc hậu cần, check-in, chuẩn bị quà tặng.",
        "Yêu thích công việc gắn kết con người và tổ chức các sự kiện quy mô lớn."
      ],
      benefits: [
        "Rèn luyện kỹ năng quản lý dự án (Project Management) và lãnh đạo đội ngũ thực chiến.",
        "Mạng lưới quan hệ rộng khắp với các diễn giả công nghệ, doanh nghiệp đối tác và nhà tài trợ.",
        "Trải nghiệm cảm giác tự hào khi cùng đồng đội tạo nên những sự kiện hàng trăm người bùng nổ."
      ]
    }
  }
];

// Khung Tuyển Chọn Trưởng Ban (Lead Roles) Fall 2026
export const LEAD_ROLES_DATA: LeadRole[] = [
  {
    id: "lead-ai",
    role: "Lead AI (Trưởng Ban Trí Tuệ Nhân Tạo)",
    departmentId: "tech-ai",
    division: "KHỐI TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#FBBC04",
    pastelColor: "#FFE7A5",
    mission: "Định hướng nghiên cứu GenAI & Gemini API, dẫn dắt đội ngũ kỹ thuật AI thi đấu và chia sẻ kiến thức.",
    responsibilities: [
      "Xây dựng lộ trình đào tạo nội bộ (Study Jams) mảng AI/LLM cho thành viên Gen 4.0.",
      "Chủ trì các buổi sinh hoạt chuyên môn, code review các dự án AI của câu lạc bộ.",
      "Lên kế hoạch tổ chức chuỗi workshop kỹ thuật 'Build & Share Series' về Generative AI."
    ],
    requirements: [
      "Sinh viên FPTU có kinh nghiệm thực tế triển khai các dự án AI/Data/LLM.",
      "Khả năng truyền đạt, hướng dẫn và kết nối các thành viên trong ban.",
      "Cam kết gắn bó và dành thời gian dẫn dắt chuyên môn trong kỳ Fall 2026."
    ]
  },
  {
    id: "lead-cloud",
    role: "Lead Cloud (Trưởng Ban Điện Toán Đám Mây)",
    departmentId: "tech-cloud",
    division: "KHỐI TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#4285F4",
    pastelColor: "#C3ECF6",
    mission: "Quản trị toàn diện hạ tầng GCP và dẫn dắt chiến dịch phong trào Google Cloud Skills Boost toàn trường.",
    responsibilities: [
      "Quản lý kiến trúc cloud, giám sát bảo mật và triển khai các ứng dụng của GDGoC.",
      "Phát động và điều phối chiến dịch 'Google Cloud Skills Boost Challenge' kỳ Fall 2026.",
      "Đào tạo kỹ năng DevOps, Docker và CI/CD cho các thành viên kỹ thuật."
    ],
    requirements: [
      "Có kinh nghiệm làm việc với GCP, Docker và quy trình deployment ứng dụng.",
      "Có định hướng hoặc đã có chứng chỉ Google Cloud là một lợi thế lớn.",
      "Tinh thần trách nhiệm cao đối với tính ổn định của hệ thống."
    ]
  },
  {
    id: "lead-web",
    role: "Lead Web (Trưởng Ban Phát Triển Web)",
    departmentId: "tech-web",
    division: "KHỐI TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#34A853",
    pastelColor: "#CCF6C5",
    mission: "Kiến trúc sư trưởng cho các nền tảng web, cổng sự kiện và hệ thống check-in của GDGoC.",
    responsibilities: [
      "Quyết định kiến trúc công nghệ (Tech Stack) cho các dự án web của câu lạc bộ.",
      "Phân chia task, review pull request và bảo đảm tiến độ release trước mỗi sự kiện lớn.",
      "Tổ chức mentoring kỹ thuật React, Next.js, TypeScript cho thành viên mới."
    ],
    requirements: [
      "Kinh nghiệm làm Web Fullstack vững vàng (React/Next.js/Node.js/TypeScript).",
      "Kỹ năng quản lý source code Git nhóm và review chất lượng mã nguồn.",
      "Tác phong làm việc chuẩn mực, đúng hạn và kỹ năng giao tiếp tốt."
    ]
  },
  {
    id: "lead-research",
    role: "Lead Research (Trưởng Ban Nghiên Cứu)",
    departmentId: "tech-research",
    division: "KHỐI TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#EA4335",
    pastelColor: "#F8D8D8",
    mission: "Dẫn dắt các nhóm sinh viên nghiên cứu khoa học, làm việc cùng giảng viên và xuất bản bài báo học thuật.",
    responsibilities: [
      "Kết nối đề tài với các thầy cô giảng viên Đại học FPT TP.HCM.",
      "Tổ chức seminar phương pháp luận nghiên cứu và kỹ thuật viết bài báo khoa học.",
      "Theo dõi tiến độ nộp bài các hội thảo sinh viên (ResFes) và các tạp chí chuyên ngành."
    ],
    requirements: [
      "Có kinh nghiệm tham gia nghiên cứu khoa học sinh viên hoặc đồ án học thuật chuyên sâu.",
      "Kỹ năng đọc hiểu tài liệu nghiên cứu tiếng Anh và tư duy phương pháp khoa học chuẩn xác.",
      "Khả năng truyền cảm hứng học thuật và kết nối với giảng viên."
    ]
  },
  {
    id: "lead-media",
    role: "Lead Media (Trưởng Ban Truyền Thông & Thiết Kế)",
    departmentId: "nontech-media",
    division: "KHỐI NON-TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#FF7DAF",
    pastelColor: "#FCE7F3",
    mission: "Định hình phong cách thị giác Neo-brutalism, quản lý chất lượng toàn bộ ấn phẩm và chiến dịch truyền thông.",
    responsibilities: [
      "Xây dựng định hướng hình ảnh (Brand Identity) cho từng chiến dịch sự kiện trong kỳ Fall 2026.",
      "Phân công và duyệt sản phẩm thiết kế 2D/3D, video recap trước khi công bố.",
      "Đào tạo kỹ năng thiết kế theo Google Brand Guidelines cho các bạn designer trẻ."
    ],
    requirements: [
      "Portfolio thiết kế ấn tượng (Branding, Social Media, Visual Art).",
      "Thành thạo công cụ đồ họa Figma/Photoshop/Illustrator hoặc dựng video.",
      "Kỹ năng quản lý tiến độ thiết kế để không làm trễ lịch truyền thông."
    ]
  },
  {
    id: "lead-hr-event",
    role: "Lead HR & Event (Trưởng Ban Nhân Sự & Sự Kiện)",
    departmentId: "nontech-hr-event",
    division: "KHỐI NON-TECH",
    badge: "Open for Application / Tuyển chọn nội bộ",
    accentColor: "#34A853",
    pastelColor: "#CCF6C5",
    mission: "Chỉ huy trưởng công tác tổ chức sự kiện, gắn kết văn hóa và chăm sóc đời sống tinh thần của thành viên.",
    responsibilities: [
      "Lập master plan và tổng chỉ huy nhân sự cho Google I/O Extended FPTU 2026.",
      "Xây dựng chính sách ghi nhận, khen thưởng và hoạt động gắn kết nội bộ toàn câu lạc bộ.",
      "Điều phối tài chính, trang thiết bị và đối ngoại với các ban ngành nhà trường."
    ],
    requirements: [
      "Kinh nghiệm dày dặn trong việc tổ chức các sự kiện quy mô từ 100+ người trở lên.",
      "Khả năng lãnh đạo, giải quyết mâu thuẫn và truyền lửa cho tập thể.",
      "Cực kỳ chu đáo, nhiệt tình và có kỹ năng giao tiếp xuất sắc."
    ]
  }
];

// Số liệu tổng kết thực tế của kỳ Summer 2026
export const STATS_DATA: StatMilestone[] = [
  {
    value: "10",
    number: 10,
    suffix: "",
    label: "Hoạt Động & Sự Kiện",
    description: "Đã tổ chức thành công trong kỳ Summer 2026, tạo sân chơi công nghệ sôi động cho sinh viên.",
    accentColor: "#4285F4",
    pastelColor: "#C3ECF6"
  },
  {
    value: "100+",
    number: 100,
    suffix: "+",
    label: "Lượt Sinh Viên Tham Gia",
    description: "Sinh viên tham dự trực tiếp và tích cực tại các buổi codelab, workshop và tech talk trên campus.",
    accentColor: "#34A853",
    pastelColor: "#CCF6C5"
  },
  {
    value: "30+",
    number: 30,
    suffix: "+",
    label: "Thành Viên Cốt Cán",
    description: "Đội ngũ Core Members năng nổ, nhiệt huyết cống hiến hết mình trong mọi công tác vận hành.",
    accentColor: "#FBBC04",
    pastelColor: "#FFE7A5"
  },
  {
    value: "Impact Maker",
    number: 1,
    suffix: "",
    label: "AI Riser Vietnam 2026",
    description: "Vinh dự đạt danh hiệu 'The GDGoC Impact Maker' do Google Developer Ecosystem trao tặng.",
    accentColor: "#EA4335",
    pastelColor: "#F8D8D8"
  }
];

// Pipeline sự kiện trọng điểm kỳ Fall 2026
export const EVENTS_DATA: EventItem[] = [
  {
    id: "ai-riser-showcase",
    title: "Showcase & Awarding Day - AI Riser Vietnam",
    category: "Showcase",
    date: "20/09/2026",
    time: "08:30 AM - 12:00 PM (GMT+7)",
    location: "Hội trường Edison, ĐH FPT TP.HCM (D9 Hi-Tech Park)",
    isHybrid: true,
    status: "Registration Open",
    accentColor: "#EA4335",
    pastelColor: "#F8D8D8",
    speaker: {
      name: "Đội Ngũ AI Riser FPTU",
      role: '"The GDGoC Impact Maker" • AI Riser Vietnam 2026',
      company: "GDG on Campus FPTU HCMC",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
    },
    summary: "Buổi triển lãm và giao lưu các giải pháp GenAI tiêu biểu của GDGoC FPTU HCMC tại AI Riser Vietnam 2026, cùng kinh nghiệm thực chiến từ các thành viên.",
    highlights: [
      'Giao lưu cùng đội ngũ đạt danh hiệu "The GDGoC Impact Maker"',
      "Demo trực tiếp các ứng dụng GenAI tích hợp Gemini API",
      "Giao lưu cùng đại diện Google Developer Ecosystem & Giảng viên",
      "Nhận certificate và quà tặng Google Swag độc quyền"
    ],
    bevyUrl: "https://gdg.community.dev/gdg-on-campus-fpt-university-ho-chi-minh-city-vietnam/"
  },
  {
    id: "google-io-extended-2026",
    title: "Google I/O Extended FPT University 2026",
    category: "Flagship Event",
    date: "18/10/2026",
    time: "08:00 AM - 05:00 PM (GMT+7)",
    location: "Khu Phức Hợp Sự Kiện Alpha & Edison, ĐH FPT TP.HCM",
    isHybrid: true,
    status: "Opening Soon",
    accentColor: "#4285F4",
    pastelColor: "#C3ECF6",
    speaker: {
      name: "Google Developer Experts (GDE)",
      role: "Keynote Speakers & Tech Industry Leaders",
      company: "Google Developer Ecosystem",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
    },
    summary: "Đại sự kiện thường niên lớn nhất của GDG on Campus, cập nhật những công nghệ đột phá mới nhất từ Google I/O: Gemini 2.0, Cloud Computing, Android 15, Web Platform cùng hàng loạt hoạt động trải nghiệm.",
    highlights: [
      "Quy mô dự kiến hơn 300+ sinh viên và lập trình viên tham dự",
      "Khu trải nghiệm công nghệ tương tác Tech Expo & Hands-on Lab",
      "4 Tracks chuyên môn chuyên sâu: AI, Cloud, Web, Career Talk",
      "Cơ hội networking kết nối cùng các doanh nghiệp công nghệ đối tác"
    ],
    bevyUrl: "https://gdg.community.dev/gdg-on-campus-fpt-university-ho-chi-minh-city-vietnam/"
  },
  {
    id: "build-and-share-series",
    title: "Build with AI: Gemini Multimodal & Agentic Workflows",
    category: "Workshop Series",
    date: "08/11/2026",
    time: "01:30 PM - 05:30 PM (GMT+7)",
    location: "Lab Beta 402, ĐH FPT TP.HCM (Campus D9 SHTP)",
    isHybrid: true,
    status: "Upcoming",
    accentColor: "#34A853",
    pastelColor: "#CCF6C5",
    speaker: {
      name: "Tran Nguyen Bao",
      role: "AI Lead, GDG on Campus FPTU & Student Researcher",
      company: "GDG on Campus FPTU HCMC",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
    },
    summary: "Hands-on lab coding with the Gemini API tool-calling functions, vector embeddings, and building a practical campus AI assistant from scratch.",
    highlights: [
      "Hands-on coding: Gemini API & RAG System từ cơ bản đến nâng cao",
      "Deploy ứng dụng containerized lên Google Cloud Run",
      "Thực chiến lập trình Fullstack với Next.js & Tailwind CSS",
      "Seminar phương pháp nghiên cứu khoa học cho sinh viên IT"
    ],
    bevyUrl: "https://gdg.community.dev/gdg-on-campus-fpt-university-ho-chi-minh-city-vietnam/"
  },
  {
    id: "cloud-skills-boost-challenge",
    title: "Google Solution Challenge 2027: Ideation & Bootcamp",
    category: "Campus Challenge",
    date: "06/12/2026",
    time: "08:30 AM - 05:00 PM (GMT+7)",
    location: "Hall A, Alpha Building, FPT University HCMC",
    isHybrid: true,
    status: "Upcoming",
    accentColor: "#FBBC04",
    pastelColor: "#FFE7A5",
    speaker: {
      name: "Le Minh Duc",
      role: "Google Developer Expert (GCP) & Chapter Advisor",
      company: "Google Developer Ecosystem",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
    },
    summary: "Kickstart your project addressing the United Nations 17 Sustainable Development Goals using Google Cloud, Gemini, and Flutter with 1-on-1 mentor guidance.",
    highlights: [
      "Cấp quyền truy cập tài nguyên Google Cloud Skills Boost miễn phí",
      "Bảng xếp hạng vinh danh Top sinh viên chinh phục nhiều badge nhất",
      "Cơ hội nhận voucher thi chứng chỉ Associate Cloud Engineer",
      "Bộ quà tặng áo thun, bình nước, balo Google Cloud chính hãng"
    ],
    bevyUrl: "https://gdg.community.dev/gdg-on-campus-fpt-university-ho-chi-minh-city-vietnam/"
  }
];

export const VALUES_PILLARS = [
  {
    title: "Connect",
    accentColor: "#4285F4",
    pastelColor: "#C3ECF6",
    iconName: "Users2",
    description: "Kết nối cộng đồng sinh viên đam mê công nghệ tại Đại học FPT TP.HCM cùng các chuyên gia Google Developer Experts và cựu sinh viên thành đạt."
  },
  {
    title: "Learn",
    accentColor: "#34A853",
    pastelColor: "#CCF6C5",
    iconName: "BookOpenCheck",
    description: "Học tập qua thực hành với hệ sinh thái công nghệ của Google: Gemini AI, Google Cloud Platform, Angular, Flutter, Web Vitals."
  },
  {
    title: "Grow",
    accentColor: "#FBBC04",
    pastelColor: "#FFE7A5",
    iconName: "TrendingUp",
    description: "Phát triển toàn diện từ kỹ năng chuyên môn lập trình đến kỹ năng mềm, kỹ năng quản lý dự án và phong thái lãnh đạo công nghệ."
  },
  {
    title: "Build for Impact",
    accentColor: "#EA4335",
    pastelColor: "#F8D8D8",
    iconName: "Sparkles",
    description: "Lan tỏa giá trị tích cực bằng những dòng code thật, giải quyết bài toán thực tế cho cộng đồng sinh viên và xã hội."
  }
];

// Core Community Leads & Organizers (Meet the Student Organizers)
export const CORE_ORGANIZERS_DATA: OrganizerMember[] = [
  {
    id: "lead-phuong",
    name: "Dang Mai Phuong",
    role: "Chapter Lead Organizer",
    domain: "Leads",
    major: "Software Engineering",
    cohort: "K17",
    bio: "Passionate about building inclusive tech communities and connecting student engineers with industry mentors and Google opportunities.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    color: "#4285F4",
    dotColor: "#4285F4",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-tuan",
    name: "Hoang Minh Tuan",
    role: "Technical Lead (Cloud & Architecture)",
    domain: "Tech",
    major: "Information Assurance & Cloud",
    cohort: "K17",
    bio: "Google Cloud Certified Associate Cloud Engineer. Loves containerization, Golang, and designing resilient distributed backends.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    color: "#4285F4",
    dotColor: "#4285F4",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-bao",
    name: "Tran Nguyen Bao",
    role: "AI & Machine Learning Lead",
    domain: "Tech",
    major: "Artificial Intelligence",
    cohort: "K18",
    bio: "Researcher in NLP and LLM agents. Exploring multimodal Gemini capabilities, RAG pipelines, and automated reasoning systems.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    color: "#FBBC04",
    dotColor: "#FBBC04",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-anh",
    name: "Pham Quoc Anh",
    role: "Mobile Development Lead",
    domain: "Tech",
    major: "Software Engineering",
    cohort: "K18",
    bio: "Flutter enthusiast and open-source contributor. Shipped 5+ mobile apps to App Store & Google Play with 50K+ total downloads.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    color: "#34A853",
    dotColor: "#34A853",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-long",
    name: "Nguyen Hoang Long",
    role: "Algorithm & CP Lead",
    domain: "Tech",
    major: "Computer Science",
    cohort: "K18",
    bio: "ICPC Asia Regional Silver Medalist, Codeforces Master. Mentoring students in competitive programming and technical interviews.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    color: "#EA4335",
    dotColor: "#EA4335",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-huong",
    name: "Vu Thi Lan Huong",
    role: "Creative Design & Media Lead",
    domain: "Design & Media",
    major: "Digital Art & Design",
    cohort: "K18",
    bio: "Crafting modern Google brand experiences, neo-brutalist tech visuals, UI/UX design systems, and motion graphics for chapter media.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    color: "#FF7DAF",
    dotColor: "#FF7DAF",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-thinh",
    name: "Bui Duc Thinh",
    role: "Event Operations & Logistics Lead",
    domain: "Event Operations",
    major: "Information Systems",
    cohort: "K19",
    bio: "Orchestrating memorable hackathons, booking halls, managing tech AV setups, and ensuring seamless experiences for our community members.",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    color: "#34A853",
    dotColor: "#34A853",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  },
  {
    id: "lead-linh",
    name: "Nguyen Khanh Linh",
    role: "Community Relations Lead",
    domain: "Event Operations",
    major: "International Business & IT",
    cohort: "K19",
    bio: "Connecting student developers with tech startups, coordinating university partnerships, and fostering a warm, collaborative environment.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    color: "#4285F4",
    dotColor: "#4285F4",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    portfolioUrl: "https://gdg.community.dev"
  }
];

