import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

const prisma = new PrismaClient();

// Avatar URLs from randomuser.me (free, no API key needed)
const avatarUrls = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
  'https://randomuser.me/api/portraits/women/16.jpg',
  'https://randomuser.me/api/portraits/men/17.jpg',
  'https://randomuser.me/api/portraits/women/18.jpg',
  'https://randomuser.me/api/portraits/men/19.jpg',
  'https://randomuser.me/api/portraits/women/20.jpg',
];

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => {
      fs.unlink(filepath, () => {});
      resolve(false);
    });
  });
}

// Question templates
const questionTemplates = [
  // Web安全
  { category: 'Web安全', difficulty: 'easy', type: 'single', title: '以下哪种攻击方式属于注入攻击？', options: ['A. SQL注入', 'B. XSS跨站脚本', 'C. CSRF跨站请求伪造', 'D. 中间人攻击'], answer: 'A. SQL注入', explanation: 'SQL注入是最典型的注入攻击，通过在输入中插入恶意SQL语句来操控数据库查询。', tags: ['SQL注入', '注入攻击'], score: 2 },
  { category: 'Web安全', difficulty: 'easy', type: 'single', title: 'XSS攻击的全称是什么？', options: ['A. Cross Site Scripting', 'B. Cross Server Scripting', 'C. Cross Site Security', 'D. Cross System Scripting'], answer: 'A. Cross Site Scripting', explanation: 'XSS全称Cross Site Scripting（跨站脚本攻击），因为CSS已被用于层叠样式表，所以简写为XSS。', tags: ['XSS', '跨站脚本'], score: 2 },
  { category: 'Web安全', difficulty: 'medium', type: 'multiple', title: '以下哪些是防御SQL注入的有效方法？', options: ['A. 使用参数化查询', 'B. 使用存储过程', 'C. 输入验证和过滤', 'D. 关闭数据库远程访问'], answer: ['A. 使用参数化查询', 'B. 使用存储过程', 'C. 输入验证和过滤'], explanation: '参数化查询是最有效的防御手段，存储过程和输入验证也是重要措施。', tags: ['SQL注入', '防御'], score: 3 },
  { category: 'Web安全', difficulty: 'medium', type: 'single', title: 'CSRF攻击利用的是什么机制？', options: ['A. 用户浏览器的Cookie自动携带机制', 'B. 服务器端Session机制', 'C. 数据库连接池机制', 'D. DNS解析机制'], answer: 'A. 用户浏览器的Cookie自动携带机制', explanation: 'CSRF利用浏览器自动携带Cookie的机制发送恶意请求。', tags: ['CSRF', '跨站请求伪造'], score: 3 },
  { category: 'Web安全', difficulty: 'hard', type: 'truefalse', title: 'CSP（Content Security Policy）可以有效防御XSS攻击。', options: [], answer: '正确', explanation: 'CSP通过限制页面可以加载的资源来源，有效阻止了恶意脚本的执行。', tags: ['CSP', 'XSS防御'], score: 4 },
  { category: 'Web安全', difficulty: 'easy', type: 'fillblank', title: 'HTTP状态码403表示的含义是。', options: [], answer: ['Forbidden', 'forbidden', '禁止访问'], explanation: 'HTTP 403 Forbidden表示服务器理解请求但拒绝执行。', tags: ['HTTP', '状态码'], score: 2 },
  { category: 'Web安全', difficulty: 'medium', type: 'single', title: '以下哪个HTTP头可以防止点击劫持攻击？', options: ['A. X-Frame-Options', 'B. X-XSS-Protection', 'C. Content-Type', 'D. Cache-Control'], answer: 'A. X-Frame-Options', explanation: 'X-Frame-Options头控制页面是否可以在iframe中加载。', tags: ['点击劫持', 'HTTP头'], score: 3 },
  { category: 'Web安全', difficulty: 'hard', type: 'multiple', title: '以下哪些属于OWASP Top 10安全风险？', options: ['A. 注入', 'B. 失效的身份认证', 'C. 敏感数据泄露', 'D. 不安全的反序列化'], answer: ['A. 注入', 'B. 失效的身份认证', 'C. 敏感数据泄露', 'D. 不安全的反序列化'], explanation: '这四项都属于OWASP Top 10安全风险。', tags: ['OWASP', '安全风险'], score: 4 },

  // 密码学
  { category: '密码学', difficulty: 'easy', type: 'single', title: 'AES加密的分组长度是多少位？', options: ['A. 64位', 'B. 128位', 'C. 256位', 'D. 512位'], answer: 'B. 128位', explanation: 'AES的分组长度固定为128位。', tags: ['AES', '对称加密'], score: 2 },
  { category: '密码学', difficulty: 'easy', type: 'single', title: '以下哪个不是非对称加密算法？', options: ['A. RSA', 'B. ECC', 'C. AES', 'D. DSA'], answer: 'C. AES', explanation: 'AES是对称加密算法。', tags: ['非对称加密', 'AES'], score: 2 },
  { category: '密码学', difficulty: 'medium', type: 'multiple', title: '以下哪些属于哈希算法？', options: ['A. MD5', 'B. SHA-256', 'C. RSA', 'D. CRC32'], answer: ['A. MD5', 'B. SHA-256', 'D. CRC32'], explanation: 'MD5和SHA-256是密码学哈希算法，CRC32是校验和算法。', tags: ['哈希', 'MD5', 'SHA'], score: 3 },
  { category: '密码学', difficulty: 'medium', type: 'truefalse', title: 'HTTPS使用SSL/TLS协议来加密传输层数据。', options: [], answer: '正确', explanation: 'HTTPS在HTTP和TCP之间加入了SSL/TLS协议层。', tags: ['HTTPS', 'TLS'], score: 3 },
  { category: '密码学', difficulty: 'hard', type: 'single', title: 'RSA加密算法的安全性基于什么数学难题？', options: ['A. 离散对数问题', 'B. 大整数分解问题', 'C. 椭圆曲线问题', 'D. 背包问题'], answer: 'B. 大整数分解问题', explanation: 'RSA基于大整数分解的困难性。', tags: ['RSA', '数学难题'], score: 4 },
  { category: '密码学', difficulty: 'easy', type: 'fillblank', title: 'Base64编码使用个字符来表示所有二进制数据。', options: [], answer: ['64', '六十四'], explanation: 'Base64使用64个可打印字符。', tags: ['Base64', '编码'], score: 2 },
  { category: '密码学', difficulty: 'medium', type: 'single', title: '以下哪种加密方式属于流加密？', options: ['A. AES', 'B. DES', 'C. RC4', 'D. 3DES'], answer: 'C. RC4', explanation: 'RC4是一种流加密算法。', tags: ['流加密', 'RC4'], score: 3 },
  { category: '密码学', difficulty: 'hard', type: 'multiple', title: '以下哪些是公钥基础设施（PKI）的组成部分？', options: ['A. 数字证书', 'B. 证书颁发机构（CA）', 'C. 注册机构（RA）', 'D. 证书吊销列表（CRL）'], answer: ['A. 数字证书', 'B. 证书颁发机构（CA）', 'C. 注册机构（RA）', 'D. 证书吊销列表（CRL）'], explanation: 'PKI包含数字证书、CA、RA、CRL等核心组件。', tags: ['PKI', '数字证书'], score: 4 },

  // 逆向工程
  { category: '逆向工程', difficulty: 'easy', type: 'single', title: '以下哪个工具常用于Windows平台的动态调试？', options: ['A. IDA Pro', 'B. OllyDbg', 'C. Ghidra', 'D. Radare2'], answer: 'B. OllyDbg', explanation: 'OllyDbg是Windows平台常用的动态调试器。', tags: ['调试', 'OllyDbg'], score: 2 },
  { category: '逆向工程', difficulty: 'medium', type: 'truefalse', title: '加壳（Packing）是一种保护软件不被逆向分析的技术。', options: [], answer: '正确', explanation: '加壳通过对可执行文件进行压缩或加密增加逆向难度。', tags: ['加壳', '保护'], score: 3 },
  { category: '逆向工程', difficulty: 'hard', type: 'single', title: 'x86架构中，EIP寄存器存储的是什么？', options: ['A. 栈顶指针', 'B. 下一条要执行的指令地址', 'C. 基址指针', 'D. 标志寄存器'], answer: 'B. 下一条要执行的指令地址', explanation: 'EIP存储下一条要执行的指令地址。', tags: ['x86', '寄存器'], score: 4 },
  { category: '逆向工程', difficulty: 'medium', type: 'multiple', title: '以下哪些是常见的反调试技术？', options: ['A. IsDebuggerPresent检测', 'B. 时间差检测', 'C. 异常处理检测', 'D. 代码混淆'], answer: ['A. IsDebuggerPresent检测', 'B. 时间差检测', 'C. 异常处理检测'], explanation: '代码混淆属于代码保护技术，不是反调试技术。', tags: ['反调试', '保护'], score: 3 },
  { category: '逆向工程', difficulty: 'easy', type: 'fillblank', title: 'ELF是Linux平台上的格式。', options: [], answer: ['可执行文件', 'Executable', 'executable'], explanation: 'ELF是Linux/Unix系统上标准的可执行文件格式。', tags: ['ELF', 'Linux'], score: 2 },
  { category: '逆向工程', difficulty: 'hard', type: 'single', title: '在x86汇编中，PUSH指令执行后ESP寄存器会如何变化？', options: ['A. 增加4', 'B. 减少4', 'C. 不变', 'D. 减少8'], answer: 'B. 减少4', explanation: 'x86架构中栈向下增长，PUSH使ESP减少。', tags: ['汇编', '栈'], score: 4 },

  // Misc
  { category: 'Misc', difficulty: 'easy', type: 'single', title: '以下哪种编码方式可以将二进制数据转换为可打印字符？', options: ['A. Base64', 'B. URL编码', 'C. HTML实体编码', 'D. Unicode编码'], answer: 'A. Base64', explanation: 'Base64将二进制数据转换为64个可打印ASCII字符。', tags: ['编码', 'Base64'], score: 2 },
  { category: 'Misc', difficulty: 'medium', type: 'truefalse', title: 'LSB隐写术是指将信息隐藏在图像的最低有效位中。', options: [], answer: '正确', explanation: 'LSB通过修改像素值的最低有效位隐藏信息。', tags: ['隐写术', 'LSB'], score: 3 },
  { category: 'Misc', difficulty: 'easy', type: 'fillblank', title: '在CTF竞赛中，flag通常以格式提交。', options: [], answer: ['flag{', 'flag'], explanation: 'CTF中的flag通常以flag{...}格式提交。', tags: ['CTF', 'flag'], score: 2 },
  { category: 'Misc', difficulty: 'medium', type: 'single', title: '以下哪个命令可以查看Linux系统中开放的网络端口？', options: ['A. ps', 'B. netstat', 'C. ls', 'D. cat'], answer: 'B. netstat', explanation: 'netstat显示网络连接、路由表等信息。', tags: ['Linux', '网络'], score: 3 },
  { category: 'Misc', difficulty: 'hard', type: 'multiple', title: '以下哪些属于信息收集的常用工具？', options: ['A. Nmap', 'B. Whois', 'C. Burp Suite', 'D. Shodan'], answer: ['A. Nmap', 'B. Whois', 'D. Shodan'], explanation: 'Nmap用于端口扫描，Whois用于域名查询，Shodan是物联网搜索引擎。', tags: ['信息收集', '工具'], score: 4 },
  { category: 'Misc', difficulty: 'medium', type: 'single', title: '以下哪种文件头标识表示这是一个PNG图片文件？', options: ['A. FF D8 FF', 'B. 89 50 4E 47', 'C. 47 49 46', 'D. 50 4B 03 04'], answer: 'B. 89 50 4E 47', explanation: 'PNG的魔数是89 50 4E 47。', tags: ['文件头', 'PNG'], score: 3 },

  // 网络安全基础
  { category: '网络安全基础', difficulty: 'easy', type: 'single', title: 'OSI七层模型中，TCP协议工作在哪一层？', options: ['A. 网络层', 'B. 传输层', 'C. 会话层', 'D. 应用层'], answer: 'B. 传输层', explanation: 'TCP工作在OSI模型的传输层（第4层）。', tags: ['OSI', 'TCP'], score: 2 },
  { category: '网络安全基础', difficulty: 'easy', type: 'truefalse', title: '防火墙可以完全阻止所有类型的网络攻击。', options: [], answer: '错误', explanation: '防火墙无法阻止应用层攻击、社会工程学攻击等。', tags: ['防火墙', '安全'], score: 2 },
  { category: '网络安全基础', difficulty: 'medium', type: 'single', title: '以下哪种协议用于在网络中自动分配IP地址？', options: ['A. DNS', 'B. DHCP', 'C. ARP', 'D. ICMP'], answer: 'B. DHCP', explanation: 'DHCP自动分配IP地址等网络配置。', tags: ['DHCP', '网络协议'], score: 3 },
  { category: '网络安全基础', difficulty: 'medium', type: 'multiple', title: '以下哪些属于网络安全的基本要素（CIA三元组）？', options: ['A. 机密性', 'B. 完整性', 'C. 可用性', 'D. 不可否认性'], answer: ['A. 机密性', 'B. 完整性', 'C. 可用性'], explanation: 'CIA三元组：机密性、完整性、可用性。', tags: ['CIA', '安全要素'], score: 3 },
  { category: '网络安全基础', difficulty: 'easy', type: 'fillblank', title: 'HTTP协议默认使用的端口号是。', options: [], answer: ['80'], explanation: 'HTTP默认80端口，HTTPS默认443端口。', tags: ['HTTP', '端口'], score: 2 },
  { category: '网络安全基础', difficulty: 'hard', type: 'single', title: '以下哪种攻击属于被动攻击？', options: ['A. 拒绝服务攻击', 'B. 网络嗅探', 'C. SQL注入', 'D. 中间人攻击'], answer: 'B. 网络嗅探', explanation: '被动攻击只监听不修改数据。', tags: ['被动攻击', '嗅探'], score: 4 },

  // 操作系统安全
  { category: '操作系统安全', difficulty: 'easy', type: 'single', title: 'Linux系统中，root用户的UID是多少？', options: ['A. 0', 'B. 1', 'C. 100', 'D. 1000'], answer: 'A. 0', explanation: 'root用户的UID固定为0。', tags: ['Linux', 'UID'], score: 2 },
  { category: '操作系统安全', difficulty: 'medium', type: 'truefalse', title: 'Windows系统中的SAM文件存储了用户的密码哈希值。', options: [], answer: '正确', explanation: 'SAM存储本地用户账户的密码哈希值。', tags: ['Windows', 'SAM'], score: 3 },
  { category: '操作系统安全', difficulty: 'medium', type: 'single', title: '以下哪个Linux文件权限设置最为安全？', options: ['A. 777', 'B. 755', 'C. 644', 'D. 600'], answer: 'D. 600', explanation: '600只有文件所有者可读写。', tags: ['Linux', '权限'], score: 3 },
  { category: '操作系统安全', difficulty: 'hard', type: 'multiple', title: '以下哪些是Linux系统安全加固的措施？', options: ['A. 禁用不必要的服务', 'B. 配置iptables防火墙', 'C. 定期更新系统补丁', 'D. 使用sudo替代root'], answer: ['A. 禁用不必要的服务', 'B. 配置iptables防火墙', 'C. 定期更新系统补丁', 'D. 使用sudo替代root'], explanation: '这四项都是Linux安全加固的标准措施。', tags: ['Linux', '安全加固'], score: 4 },
  { category: '操作系统安全', difficulty: 'easy', type: 'fillblank', title: 'Windows系统中查看当前登录用户的命令是。', options: [], answer: ['whoami', 'who am i'], explanation: 'whoami显示当前登录用户名。', tags: ['Windows', '命令'], score: 2 },
  { category: '操作系统安全', difficulty: 'medium', type: 'single', title: 'SELinux的全称是什么？', options: ['A. Secure Linux', 'B. Security Enhanced Linux', 'C. System Enhanced Linux', 'D. Safe Environment Linux'], answer: 'B. Security Enhanced Linux', explanation: 'SELinux是由NSA开发的强制访问控制安全模块。', tags: ['SELinux', '访问控制'], score: 3 },

  // 安全法规与合规
  { category: '安全法规与合规', difficulty: 'easy', type: 'single', title: '中国的《网络安全法》是哪一年正式实施的？', options: ['A. 2015年', 'B. 2016年', 'C. 2017年', 'D. 2018年'], answer: 'C. 2017年', explanation: '《网络安全法》2017年6月1日起正式施行。', tags: ['网络安全法', '法规'], score: 2 },
  { category: '安全法规与合规', difficulty: 'medium', type: 'truefalse', title: 'GDPR（通用数据保护条例）是欧盟的数据保护法规。', options: [], answer: '正确', explanation: 'GDPR是欧盟于2018年5月25日生效的数据保护法规。', tags: ['GDPR', '数据保护'], score: 3 },
  { category: '安全法规与合规', difficulty: 'medium', type: 'single', title: '中国网络安全等级保护制度（等保2.0）将信息系统分为几个等级？', options: ['A. 3个', 'B. 4个', 'C. 5个', 'D. 6个'], answer: 'C. 5个', explanation: '等保2.0分为五级。', tags: ['等保', '等级保护'], score: 3 },
  { category: '安全法规与合规', difficulty: 'hard', type: 'multiple', title: '以下哪些属于个人信息保护的基本原则？', options: ['A. 合法正当必要原则', 'B. 明示同意原则', 'C. 最小必要原则', 'D. 公开透明原则'], answer: ['A. 合法正当必要原则', 'B. 明示同意原则', 'C. 最小必要原则', 'D. 公开透明原则'], explanation: '这四项都是个人信息保护的核心原则。', tags: ['个人信息', '保护原则'], score: 4 },
  { category: '安全法规与合规', difficulty: 'easy', type: 'fillblank', title: '《中华人民共和国数据安全法》于年6月10日通过。', options: [], answer: ['2021'], explanation: '《数据安全法》于2021年6月10日通过。', tags: ['数据安全法', '法规'], score: 2 },
  { category: '安全法规与合规', difficulty: 'medium', type: 'single', title: '以下哪个标准是信息安全管理体系的国际标准？', options: ['A. ISO 9001', 'B. ISO 27001', 'C. ISO 14001', 'D. ISO 45001'], answer: 'B. ISO 27001', explanation: 'ISO 27001是信息安全管理体系的国际标准。', tags: ['ISO 27001', '标准'], score: 3 },
];

async function main() {
  console.log('🌱 Seeding database with stress test data...');

  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.wrongAnswer.deleteMany();
  await prisma.contestQuestion.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data');

  // Download avatars
  const uploadsDir = path.join(__dirname, '../uploads/avatars');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log('📸 Downloading avatar images...');
  const avatarPaths: string[] = [];
  for (let i = 0; i < avatarUrls.length; i++) {
    const ext = '.jpg';
    const filename = `avatar-${i + 1}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    const success = await downloadImage(avatarUrls[i], filepath);
    if (success) {
      avatarPaths.push(`/uploads/avatars/${filename}`);
      console.log(`  ✅ Downloaded ${filename}`);
    } else {
      avatarPaths.push('');
      console.log(`  ❌ Failed to download ${filename}`);
    }
  }

  // ---- Users (20 users with avatars) ----
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await prisma.user.create({
    data: { username: 'admin', password: adminHash, role: 'admin', avatar: avatarPaths[0] || undefined, experience: 1500, level: 6, consecutiveDays: 30, lastLoginDate: new Date() },
  });

  const usernames = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
    '郑十一', '王十二', '刘十三', '陈十四', '杨十五', '黄十六',
    '林十七', '何十八', '马十九', '罗二十', '梁廿一', '宋廿二',
  ];

  const createdUsers = await Promise.all(
    usernames.map((name, idx) => {
      const exp = Math.floor(Math.random() * 1500);
      const level = exp >= 1500 ? 6 : exp >= 1000 ? 5 : exp >= 600 ? 4 : exp >= 300 ? 3 : exp >= 100 ? 2 : 1;
      const days = Math.floor(Math.random() * 30) + 1;
      const lastLogin = new Date();
      lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 3));
      const today = new Date().toDateString();
      return prisma.user.create({
        data: {
          username: name,
          password: userHash,
          role: 'user',
          avatar: avatarPaths[idx + 1] || undefined,
          experience: exp,
          level,
          consecutiveDays: days,
          lastLoginDate: lastLogin,
          dailyGoals: JSON.stringify({
            date: today,
            practice: { current: Math.floor(Math.random() * 6), target: 5 },
            contest: { current: Math.floor(Math.random() * 2), target: 1 },
            review: { current: Math.floor(Math.random() * 4), target: 3 },
          }),
        },
      });
    })
  );
  console.log(`✅ Created ${1 + createdUsers.length} users with avatars`);

  // ---- Questions (46 questions) ----
  const createdQuestions: any[] = [];
  for (const qt of questionTemplates) {
    const created = await prisma.question.create({
      data: {
        category: qt.category,
        difficulty: qt.difficulty,
        type: qt.type,
        title: qt.title,
        options: JSON.stringify(qt.options),
        answer: JSON.stringify(qt.answer),
        explanation: qt.explanation,
        tags: JSON.stringify(qt.tags),
        score: qt.score,
      },
    });
    createdQuestions.push(created);
  }
  console.log(`✅ Created ${createdQuestions.length} questions`);

  // ---- Contests ----
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const contests = [
    { title: '第一届网络安全入门赛', description: '面向新手的入门级竞赛，包含基础题目。', startTime: threeHoursAgo, endTime: twoHoursAgo, duration: 60, status: 'finished' as const, questions: createdQuestions.slice(0, 15) },
    { title: '第二届CTF理论赛', description: 'CTF理论赛，涵盖多个安全分类。', startTime: twoHoursAgo, endTime: oneHourAgo, duration: 60, status: 'finished' as const, questions: createdQuestions.slice(5, 25) },
    { title: '密码学基础测试', description: '密码学基础知识测试。', startTime: threeHoursAgo, endTime: oneHourAgo, duration: 30, status: 'finished' as const, questions: createdQuestions.filter(q => q.category === '密码学') },
    { title: '第三届网络安全知识竞赛', description: '本次竞赛包含全部题目，涵盖Web安全、密码学、逆向工程、Misc、网络安全基础、操作系统安全、安全法规与合规等分类。答题时间60分钟，答对得分，答错不扣分。同分按用时排序。', startTime: now, endTime: oneHourLater, duration: 60, status: 'ongoing' as const, questions: createdQuestions },
    { title: 'Web安全专项赛', description: 'Web安全专项竞赛，包含Web安全分类题目。', startTime: now, endTime: twoHoursLater, duration: 45, status: 'ongoing' as const, questions: createdQuestions.filter(q => q.category === 'Web安全') },
    { title: '密码学专项赛', description: '密码学专项赛，包含密码学分类题目。答题时间45分钟。', startTime: oneDayLater, endTime: twoDaysLater, duration: 45, status: 'upcoming' as const, questions: createdQuestions.filter(q => q.category === '密码学') },
    { title: '逆向工程挑战赛', description: '逆向工程专项挑战赛。', startTime: twoDaysLater, endTime: threeDaysLater, duration: 60, status: 'upcoming' as const, questions: createdQuestions.filter(q => q.category === '逆向工程') },
    { title: '综合安全知识竞赛', description: '综合安全知识竞赛，覆盖所有分类。', startTime: threeDaysLater, endTime: new Date(threeDaysLater.getTime() + 90 * 60 * 1000), duration: 90, status: 'upcoming' as const, questions: createdQuestions },
  ];

  const createdContests: any[] = [];
  for (const c of contests) {
    const contestScore = c.questions.reduce((sum, q) => sum + q.score, 0);
    const contest = await prisma.contest.create({
      data: {
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        totalScore: contestScore,
        status: c.status,
        shuffleQuestions: true,
        shuffleOptions: true,
        contestQuestions: {
          create: c.questions.map((q, idx) => ({ questionId: q.id, sortOrder: idx })),
        },
      },
    });
    createdContests.push(contest);
  }
  console.log(`✅ Created ${createdContests.length} contests`);

  // ---- Submissions for finished contests ----
  const finishedContests = createdContests.filter((c: any) => c.status === 'finished');
  let submissionCount = 0;

  for (const contest of finishedContests) {
    const contestQuestions = await prisma.contestQuestion.findMany({
      where: { contestId: contest.id },
      include: { question: true },
    });
    const questions = contestQuestions.map(cq => cq.question);
    const contestTotalScore = questions.reduce((sum, q) => sum + q.score, 0);

    for (const user of createdUsers) {
      const scorePercent = 0.3 + Math.random() * 0.65;
      const score = Math.round(contestTotalScore * scorePercent);
      const correctCount = Math.round(questions.length * scorePercent);
      const duration = 600 + Math.floor(Math.random() * 3000);
      const submittedAt = new Date(contest.startTime.getTime() + Math.random() * (contest.endTime.getTime() - contest.startTime.getTime()));
      const startedAt = new Date(submittedAt.getTime() - duration * 1000);

      const answers: Record<string, string> = {};
      for (const q of questions) {
        const correctAnswer = JSON.parse(q.answer);
        if (q.type === 'single' && Array.isArray(correctAnswer)) {
          if (Math.random() < scorePercent) {
            answers[q.id] = correctAnswer[0];
          } else {
            const options = JSON.parse(q.options);
            const wrongOptions = options.filter((o: string) => o !== correctAnswer[0]);
            answers[q.id] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || correctAnswer[0];
          }
        } else if (q.type === 'truefalse') {
          answers[q.id] = Math.random() < scorePercent ? correctAnswer : (correctAnswer === '正确' ? '错误' : '正确');
        } else if (q.type === 'fillblank') {
          answers[q.id] = Math.random() < scorePercent ? (Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer) : 'wrong';
        } else if (q.type === 'multiple') {
          answers[q.id] = Math.random() < scorePercent ? JSON.stringify(correctAnswer) : '["wrong"]';
        }
      }

      await prisma.submission.create({
        data: {
          userId: user.id,
          contestId: contest.id,
          score,
          totalScore: contestTotalScore,
          correctCount,
          totalCount: questions.length,
          duration,
          answers: JSON.stringify(answers),
          startedAt,
          submittedAt,
        },
      });
      submissionCount++;
    }
  }
  console.log(`✅ Created ${submissionCount} submissions`);

  // ---- Wrong Answers ----
  let wrongCount = 0;
  for (const user of createdUsers.slice(0, 5)) {
    for (let i = 0; i < 10; i++) {
      const q = createdQuestions[i % createdQuestions.length];
      const correctAnswer = JSON.parse(q.answer);
      const userAnswer = Array.isArray(correctAnswer) ? ['wrong'] : 'wrong';

      await prisma.wrongAnswer.create({
        data: {
          userId: user.id,
          questionId: q.id,
          contestId: finishedContests[0]?.id || null,
          userAnswer: JSON.stringify(userAnswer),
          correctAnswer: JSON.stringify(correctAnswer),
          errorCount: 1 + Math.floor(Math.random() * 5),
        },
      });
      wrongCount++;
    }
  }
  console.log(`✅ Created ${wrongCount} wrong answers`);

  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Summary:');
  console.log(`   Users: ${1 + createdUsers.length} (with avatars)`);
  console.log(`   Questions: ${createdQuestions.length}`);
  console.log(`   Contests: ${createdContests.length} (${finishedContests.length} finished, 2 ongoing, 3 upcoming)`);
  console.log(`   Submissions: ${submissionCount}`);
  console.log(`   Wrong Answers: ${wrongCount}`);
  console.log('\n🔑 Login credentials:');
  console.log('   Admin: admin / admin123');
  console.log('   User:  张三 / user123');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
