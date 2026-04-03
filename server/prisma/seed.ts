import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.wrongAnswer.deleteMany();
  await prisma.contestQuestion.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data');

  // ---- Users ----
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: { username: 'admin', password: adminHash, role: 'admin' },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { username: '张三', password: userHash, role: 'user' } }),
    prisma.user.create({ data: { username: '李四', password: userHash, role: 'user' } }),
    prisma.user.create({ data: { username: '王五', password: userHash, role: 'user' } }),
    prisma.user.create({ data: { username: '赵六', password: userHash, role: 'user' } }),
    prisma.user.create({ data: { username: '钱七', password: userHash, role: 'user' } }),
  ]);
  console.log(`✅ Created ${1 + users.length} users`);

  // ---- Questions ----
  const questions = [
    // Web安全 (8 questions)
    { category: 'Web安全', difficulty: 'easy', type: 'single', title: '以下哪种攻击方式属于注入攻击？', options: JSON.stringify(['A. SQL注入', 'B. XSS跨站脚本', 'C. CSRF跨站请求伪造', 'D. 中间人攻击']), answer: JSON.stringify('A. SQL注入'), explanation: 'SQL注入是最典型的注入攻击，通过在输入中插入恶意SQL语句来操控数据库查询。XSS和CSRF虽然也是Web攻击，但不属于注入攻击范畴。', tags: JSON.stringify(['SQL注入', '注入攻击']), score: 2 },
    { category: 'Web安全', difficulty: 'easy', type: 'single', title: 'XSS攻击的全称是什么？', options: JSON.stringify(['A. Cross Site Scripting', 'B. Cross Server Scripting', 'C. Cross Site Security', 'D. Cross System Scripting']), answer: JSON.stringify('A. Cross Site Scripting'), explanation: 'XSS全称Cross Site Scripting（跨站脚本攻击），因为CSS已被用于层叠样式表，所以简写为XSS。', tags: JSON.stringify(['XSS', '跨站脚本']), score: 2 },
    { category: 'Web安全', difficulty: 'medium', type: 'multiple', title: '以下哪些是防御SQL注入的有效方法？', options: JSON.stringify(['A. 使用参数化查询', 'B. 使用存储过程', 'C. 输入验证和过滤', 'D. 关闭数据库远程访问']), answer: JSON.stringify(['A. 使用参数化查询', 'B. 使用存储过程', 'C. 输入验证和过滤']), explanation: '参数化查询是最有效的防御手段，存储过程和输入验证也是重要措施。关闭数据库远程访问与SQL注入防御无直接关系。', tags: JSON.stringify(['SQL注入', '防御']), score: 3 },
    { category: 'Web安全', difficulty: 'medium', type: 'single', title: 'CSRF攻击利用的是什么机制？', options: JSON.stringify(['A. 用户浏览器的Cookie自动携带机制', 'B. 服务器端Session机制', 'C. 数据库连接池机制', 'D. DNS解析机制']), answer: JSON.stringify('A. 用户浏览器的Cookie自动携带机制'), explanation: 'CSRF（跨站请求伪造）利用的是浏览器会自动携带目标网站Cookie的机制，在用户不知情的情况下发送恶意请求。', tags: JSON.stringify(['CSRF', '跨站请求伪造']), score: 3 },
    { category: 'Web安全', difficulty: 'hard', type: 'truefalse', title: 'CSP（Content Security Policy）可以有效防御XSS攻击。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: 'CSP通过限制页面可以加载的资源来源，有效阻止了恶意脚本的执行，是防御XSS的重要手段。', tags: JSON.stringify(['CSP', 'XSS防御']), score: 4 },
    { category: 'Web安全', difficulty: 'easy', type: 'fillblank', title: 'HTTP状态码403表示的含义是。', answer: JSON.stringify(['Forbidden', 'forbidden', '禁止访问']), options: JSON.stringify([]), explanation: 'HTTP 403 Forbidden表示服务器理解请求但拒绝执行，通常是因为权限不足。', tags: JSON.stringify(['HTTP', '状态码']), score: 2 },
    { category: 'Web安全', difficulty: 'medium', type: 'single', title: '以下哪个HTTP头可以防止点击劫持攻击？', options: JSON.stringify(['A. X-Frame-Options', 'B. X-XSS-Protection', 'C. Content-Type', 'D. Cache-Control']), answer: JSON.stringify('A. X-Frame-Options'), explanation: 'X-Frame-Options头可以控制页面是否可以在iframe中加载，从而防止点击劫持攻击。', tags: JSON.stringify(['点击劫持', 'HTTP头']), score: 3 },
    { category: 'Web安全', difficulty: 'hard', type: 'multiple', title: '以下哪些属于OWASP Top 10安全风险？', options: JSON.stringify(['A. 注入', 'B. 失效的身份认证', 'C. 敏感数据泄露', 'D. 不安全的反序列化']), answer: JSON.stringify(['A. 注入', 'B. 失效的身份认证', 'C. 敏感数据泄露', 'D. 不安全的反序列化']), explanation: '这四项都属于OWASP Top 10安全风险。OWASP Top 10是Web应用安全风险的权威列表。', tags: JSON.stringify(['OWASP', '安全风险']), score: 4 },

    // 密码学 (8 questions)
    { category: '密码学', difficulty: 'easy', type: 'single', title: 'AES加密的分组长度是多少位？', options: JSON.stringify(['A. 64位', 'B. 128位', 'C. 256位', 'D. 512位']), answer: JSON.stringify('B. 128位'), explanation: 'AES（高级加密标准）的分组长度固定为128位，密钥长度可以是128、192或256位。', tags: JSON.stringify(['AES', '对称加密']), score: 2 },
    { category: '密码学', difficulty: 'easy', type: 'single', title: '以下哪个不是非对称加密算法？', options: JSON.stringify(['A. RSA', 'B. ECC', 'C. AES', 'D. DSA']), answer: JSON.stringify('C. AES'), explanation: 'AES是对称加密算法，使用相同的密钥进行加密和解密。RSA、ECC和DSA都是非对称加密算法。', tags: JSON.stringify(['非对称加密', 'AES']), score: 2 },
    { category: '密码学', difficulty: 'medium', type: 'multiple', title: '以下哪些属于哈希算法？', options: JSON.stringify(['A. MD5', 'B. SHA-256', 'C. RSA', 'D. CRC32']), answer: JSON.stringify(['A. MD5', 'B. SHA-256', 'D. CRC32']), explanation: 'MD5和SHA-256是密码学哈希算法，CRC32是校验和算法（虽然安全性不如前两者）。RSA是非对称加密算法，不属于哈希算法。', tags: JSON.stringify(['哈希', 'MD5', 'SHA']), score: 3 },
    { category: '密码学', difficulty: 'medium', type: 'truefalse', title: 'HTTPS使用SSL/TLS协议来加密传输层数据。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: 'HTTPS在HTTP和TCP之间加入了SSL/TLS协议层，对传输数据进行加密，保证数据的机密性和完整性。', tags: JSON.stringify(['HTTPS', 'TLS']), score: 3 },
    { category: '密码学', difficulty: 'hard', type: 'single', title: 'RSA加密算法的安全性基于什么数学难题？', options: JSON.stringify(['A. 离散对数问题', 'B. 大整数分解问题', 'C. 椭圆曲线问题', 'D. 背包问题']), answer: JSON.stringify('B. 大整数分解问题'), explanation: 'RSA算法的安全性基于大整数分解的困难性，即给定一个大合数n=p×q，在不知道p和q的情况下很难分解n。', tags: JSON.stringify(['RSA', '数学难题']), score: 4 },
    { category: '密码学', difficulty: 'easy', type: 'fillblank', title: 'Base64编码使用个字符来表示所有二进制数据。', answer: JSON.stringify(['64', '六十四']), options: JSON.stringify([]), explanation: 'Base64使用64个可打印字符（A-Z、a-z、0-9、+、/）来表示任意二进制数据。', tags: JSON.stringify(['Base64', '编码']), score: 2 },
    { category: '密码学', difficulty: 'medium', type: 'single', title: '以下哪种加密方式属于流加密？', options: JSON.stringify(['A. AES', 'B. DES', 'C. RC4', 'D. 3DES']), answer: JSON.stringify('C. RC4'), explanation: 'RC4是一种流加密算法，逐字节加密数据。AES、DES和3DES都是分组加密算法。', tags: JSON.stringify(['流加密', 'RC4']), score: 3 },
    { category: '密码学', difficulty: 'hard', type: 'multiple', title: '以下哪些是公钥基础设施（PKI）的组成部分？', options: JSON.stringify(['A. 数字证书', 'B. 证书颁发机构（CA）', 'C. 注册机构（RA）', 'D. 证书吊销列表（CRL）']), answer: JSON.stringify(['A. 数字证书', 'B. 证书颁发机构（CA）', 'C. 注册机构（RA）', 'D. 证书吊销列表（CRL）']), explanation: 'PKI包含数字证书、CA、RA、CRL等核心组件，共同构建了一个完整的公钥管理体系。', tags: JSON.stringify(['PKI', '数字证书']), score: 4 },

    // 逆向工程 (6 questions)
    { category: '逆向工程', difficulty: 'easy', type: 'single', title: '以下哪个工具常用于Windows平台的动态调试？', options: JSON.stringify(['A. IDA Pro', 'B. OllyDbg', 'C. Ghidra', 'D. Radare2']), answer: JSON.stringify('B. OllyDbg'), explanation: 'OllyDbg是Windows平台常用的动态调试器。IDA Pro和Ghidra主要是静态分析工具，Radare2是跨平台的逆向工具。', tags: JSON.stringify(['调试', 'OllyDbg']), score: 2 },
    { category: '逆向工程', difficulty: 'medium', type: 'truefalse', title: '加壳（Packing）是一种保护软件不被逆向分析的技术。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: '加壳通过对可执行文件进行压缩或加密，在运行时动态解压/解密，增加逆向分析的难度。', tags: JSON.stringify(['加壳', '保护']), score: 3 },
    { category: '逆向工程', difficulty: 'hard', type: 'single', title: 'x86架构中，EIP寄存器存储的是什么？', options: JSON.stringify(['A. 栈顶指针', 'B. 下一条要执行的指令地址', 'C. 基址指针', 'D. 标志寄存器']), answer: JSON.stringify('B. 下一条要执行的指令地址'), explanation: 'EIP（Extended Instruction Pointer）寄存器存储的是下一条要执行的指令的地址，是控制程序执行流程的关键寄存器。', tags: JSON.stringify(['x86', '寄存器']), score: 4 },
    { category: '逆向工程', difficulty: 'medium', type: 'multiple', title: '以下哪些是常见的反调试技术？', options: JSON.stringify(['A. IsDebuggerPresent检测', 'B. 时间差检测', 'C. 异常处理检测', 'D. 代码混淆']), answer: JSON.stringify(['A. IsDebuggerPresent检测', 'B. 时间差检测', 'C. 异常处理检测']), explanation: 'IsDebuggerPresent、时间差检测和异常处理检测都是常见的反调试技术。代码混淆属于代码保护技术，不是反调试技术。', tags: JSON.stringify(['反调试', '保护']), score: 3 },
    { category: '逆向工程', difficulty: 'easy', type: 'fillblank', title: 'ELF是Linux平台上的格式。', answer: JSON.stringify(['可执行文件', 'Executable', 'executable']), options: JSON.stringify([]), explanation: 'ELF（Executable and Linkable Format）是Linux/Unix系统上标准的可执行文件格式。', tags: JSON.stringify(['ELF', 'Linux']), score: 2 },
    { category: '逆向工程', difficulty: 'hard', type: 'single', title: '在x86汇编中，PUSH指令执行后ESP寄存器会如何变化？', options: JSON.stringify(['A. 增加4', 'B. 减少4', 'C. 不变', 'D. 减少8']), answer: JSON.stringify('B. 减少4'), explanation: 'x86架构中栈向下增长，PUSH指令将数据压入栈中，ESP（栈指针）减少4（32位）或8（64位）。', tags: JSON.stringify(['汇编', '栈']), score: 4 },

    // Misc (6 questions)
    { category: 'Misc', difficulty: 'easy', type: 'single', title: '以下哪种编码方式可以将二进制数据转换为可打印字符？', options: JSON.stringify(['A. Base64', 'B. URL编码', 'C. HTML实体编码', 'D. Unicode编码']), answer: JSON.stringify('A. Base64'), explanation: 'Base64编码将任意二进制数据转换为64个可打印ASCII字符，常用于邮件附件、数据传输等场景。', tags: JSON.stringify(['编码', 'Base64']), score: 2 },
    { category: 'Misc', difficulty: 'medium', type: 'truefalse', title: 'LSB隐写术是指将信息隐藏在图像的最低有效位中。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: 'LSB（Least Significant Bit）隐写术通过修改图像像素值的最低有效位来隐藏信息，人眼无法察觉这种微小变化。', tags: JSON.stringify(['隐写术', 'LSB']), score: 3 },
    { category: 'Misc', difficulty: 'easy', type: 'fillblank', title: '在CTF竞赛中，flag通常以格式提交。', answer: JSON.stringify(['flag{', 'flag']), options: JSON.stringify([]), explanation: 'CTF竞赛中的flag通常以flag{...}的格式提交，这是CTF社区的通用约定。', tags: JSON.stringify(['CTF', 'flag']), score: 2 },
    { category: 'Misc', difficulty: 'medium', type: 'single', title: '以下哪个命令可以查看Linux系统中开放的网络端口？', options: JSON.stringify(['A. ps', 'B. netstat', 'C. ls', 'D. cat']), answer: JSON.stringify('B. netstat'), explanation: 'netstat命令可以显示网络连接、路由表、接口统计等信息，常用于查看开放的网络端口。', tags: JSON.stringify(['Linux', '网络']), score: 3 },
    { category: 'Misc', difficulty: 'hard', type: 'multiple', title: '以下哪些属于信息收集的常用工具？', options: JSON.stringify(['A. Nmap', 'B. Whois', 'C. Burp Suite', 'D. Shodan']), answer: JSON.stringify(['A. Nmap', 'B. Whois', 'D. Shodan']), explanation: 'Nmap用于端口扫描，Whois用于域名信息查询，Shodan是物联网搜索引擎。Burp Suite主要用于Web应用安全测试，虽然也可用于信息收集，但主要定位是渗透测试工具。', tags: JSON.stringify(['信息收集', '工具']), score: 4 },
    { category: 'Misc', difficulty: 'medium', type: 'single', title: '以下哪种文件头标识表示这是一个PNG图片文件？', options: JSON.stringify(['A. FF D8 FF', 'B. 89 50 4E 47', 'C. 47 49 46', 'D. 50 4B 03 04']), answer: JSON.stringify('B. 89 50 4E 47'), explanation: 'PNG文件的魔数（Magic Number）是89 50 4E 47（即\x89PNG）。FF D8 FF是JPEG，47 49 46是GIF，50 4B 03 04是ZIP。', tags: JSON.stringify(['文件头', 'PNG']), score: 3 },

    // 网络安全基础 (6 questions)
    { category: '网络安全基础', difficulty: 'easy', type: 'single', title: 'OSI七层模型中，TCP协议工作在哪一层？', options: JSON.stringify(['A. 网络层', 'B. 传输层', 'C. 会话层', 'D. 应用层']), answer: JSON.stringify('B. 传输层'), explanation: 'TCP（传输控制协议）工作在OSI模型的传输层（第4层），提供面向连接的可靠数据传输。', tags: JSON.stringify(['OSI', 'TCP']), score: 2 },
    { category: '网络安全基础', difficulty: 'easy', type: 'truefalse', title: '防火墙可以完全阻止所有类型的网络攻击。', answer: JSON.stringify('错误'), options: JSON.stringify([]), explanation: '防火墙只能根据预设规则过滤网络流量，无法阻止所有攻击类型，如应用层攻击、社会工程学攻击、内部威胁等。', tags: JSON.stringify(['防火墙', '安全']), score: 2 },
    { category: '网络安全基础', difficulty: 'medium', type: 'single', title: '以下哪种协议用于在网络中自动分配IP地址？', options: JSON.stringify(['A. DNS', 'B. DHCP', 'C. ARP', 'D. ICMP']), answer: JSON.stringify('B. DHCP'), explanation: 'DHCP（动态主机配置协议）用于自动为网络中的设备分配IP地址、子网掩码、网关等网络配置信息。', tags: JSON.stringify(['DHCP', '网络协议']), score: 3 },
    { category: '网络安全基础', difficulty: 'medium', type: 'multiple', title: '以下哪些属于网络安全的基本要素（CIA三元组）？', options: JSON.stringify(['A. 机密性（Confidentiality）', 'B. 完整性（Integrity）', 'C. 可用性（Availability）', 'D. 不可否认性（Non-repudiation）']), answer: JSON.stringify(['A. 机密性（Confidentiality）', 'B. 完整性（Integrity）', 'C. 可用性（Availability）']), explanation: 'CIA三元组是信息安全的基本要素：机密性、完整性和可用性。不可否认性是扩展的安全属性，不属于基本三元组。', tags: JSON.stringify(['CIA', '安全要素']), score: 3 },
    { category: '网络安全基础', difficulty: 'easy', type: 'fillblank', title: 'HTTP协议默认使用的端口号是。', answer: JSON.stringify(['80']), options: JSON.stringify([]), explanation: 'HTTP协议默认使用80端口，HTTPS默认使用443端口。', tags: JSON.stringify(['HTTP', '端口']), score: 2 },
    { category: '网络安全基础', difficulty: 'hard', type: 'single', title: '以下哪种攻击属于被动攻击？', options: JSON.stringify(['A. 拒绝服务攻击', 'B. 网络嗅探', 'C. SQL注入', 'D. 中间人攻击']), answer: JSON.stringify('B. 网络嗅探'), explanation: '被动攻击是指攻击者只监听和分析网络流量而不修改数据，网络嗅探是典型的被动攻击。其他选项都是主动攻击。', tags: JSON.stringify(['被动攻击', '嗅探']), score: 4 },

    // 操作系统安全 (6 questions)
    { category: '操作系统安全', difficulty: 'easy', type: 'single', title: 'Linux系统中，root用户的UID是多少？', options: JSON.stringify(['A. 0', 'B. 1', 'C. 100', 'D. 1000']), answer: JSON.stringify('A. 0'), explanation: 'Linux系统中root用户的UID固定为0，这是系统管理员账户的标识。普通用户的UID通常从1000开始。', tags: JSON.stringify(['Linux', 'UID']), score: 2 },
    { category: '操作系统安全', difficulty: 'medium', type: 'truefalse', title: 'Windows系统中的SAM文件存储了用户的密码哈希值。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: 'SAM（Security Account Manager）文件存储了本地用户账户的密码哈希值，是Windows系统安全的重要组成部分。', tags: JSON.stringify(['Windows', 'SAM']), score: 3 },
    { category: '操作系统安全', difficulty: 'medium', type: 'single', title: '以下哪个Linux文件权限设置最为安全？', options: JSON.stringify(['A. 777', 'B. 755', 'C. 644', 'D. 600']), answer: JSON.stringify('D. 600'), explanation: '600权限表示只有文件所有者可以读写，其他用户没有任何权限，是最安全的设置。777表示所有人都有完全权限，最不安全。', tags: JSON.stringify(['Linux', '权限']), score: 3 },
    { category: '操作系统安全', difficulty: 'hard', type: 'multiple', title: '以下哪些是Linux系统安全加固的措施？', options: JSON.stringify(['A. 禁用不必要的服务', 'B. 配置iptables防火墙', 'C. 定期更新系统补丁', 'D. 使用sudo替代root直接登录']), answer: JSON.stringify(['A. 禁用不必要的服务', 'B. 配置iptables防火墙', 'C. 定期更新系统补丁', 'D. 使用sudo替代root直接登录']), explanation: '这四项都是Linux系统安全加固的标准措施：减少攻击面、网络防护、漏洞修复、权限最小化。', tags: JSON.stringify(['Linux', '安全加固']), score: 4 },
    { category: '操作系统安全', difficulty: 'easy', type: 'fillblank', title: 'Windows系统中查看当前登录用户的命令是。', answer: JSON.stringify(['whoami', 'who am i']), options: JSON.stringify([]), explanation: 'whoami命令在Windows和Linux中都可以使用，用于显示当前登录的用户名。', tags: JSON.stringify(['Windows', '命令']), score: 2 },
    { category: '操作系统安全', difficulty: 'medium', type: 'single', title: 'SELinux的全称是什么？', options: JSON.stringify(['A. Secure Linux', 'B. Security Enhanced Linux', 'C. System Enhanced Linux', 'D. Safe Environment Linux']), answer: JSON.stringify('B. Security Enhanced Linux'), explanation: 'SELinux（Security Enhanced Linux）是由NSA开发的强制访问控制安全模块，为Linux提供细粒度的访问控制。', tags: JSON.stringify(['SELinux', '访问控制']), score: 3 },

    // 安全法规与合规 (6 questions)
    { category: '安全法规与合规', difficulty: 'easy', type: 'single', title: '中国的《网络安全法》是哪一年正式实施的？', options: JSON.stringify(['A. 2015年', 'B. 2016年', 'C. 2017年', 'D. 2018年']), answer: JSON.stringify('C. 2017年'), explanation: '《中华人民共和国网络安全法》于2016年11月7日通过，2017年6月1日起正式施行。', tags: JSON.stringify(['网络安全法', '法规']), score: 2 },
    { category: '安全法规与合规', difficulty: 'medium', type: 'truefalse', title: 'GDPR（通用数据保护条例）是欧盟的数据保护法规。', answer: JSON.stringify('正确'), options: JSON.stringify([]), explanation: 'GDPR（General Data Protection Regulation）是欧盟于2018年5月25日生效的数据保护法规，对全球企业都有影响。', tags: JSON.stringify(['GDPR', '数据保护']), score: 3 },
    { category: '安全法规与合规', difficulty: 'medium', type: 'single', title: '中国网络安全等级保护制度（等保2.0）将信息系统分为几个等级？', options: JSON.stringify(['A. 3个', 'B. 4个', 'C. 5个', 'D. 6个']), answer: JSON.stringify('C. 5个'), explanation: '等保2.0将信息系统安全保护等级分为五级：第一级（自主保护级）到第五级（专控保护级）。', tags: JSON.stringify(['等保', '等级保护']), score: 3 },
    { category: '安全法规与合规', difficulty: 'hard', type: 'multiple', title: '以下哪些属于个人信息保护的基本原则？', options: JSON.stringify(['A. 合法正当必要原则', 'B. 明示同意原则', 'C. 最小必要原则', 'D. 公开透明原则']), answer: JSON.stringify(['A. 合法正当必要原则', 'B. 明示同意原则', 'C. 最小必要原则', 'D. 公开透明原则']), explanation: '这四项都是个人信息保护的核心原则，在《个人信息保护法》和GDPR中都有明确规定。', tags: JSON.stringify(['个人信息', '保护原则']), score: 4 },
    { category: '安全法规与合规', difficulty: 'easy', type: 'fillblank', title: '《中华人民共和国数据安全法》于年6月10日通过。', answer: JSON.stringify(['2021']), options: JSON.stringify([]), explanation: '《数据安全法》于2021年6月10日通过，2021年9月1日起施行。', tags: JSON.stringify(['数据安全法', '法规']), score: 2 },
    { category: '安全法规与合规', difficulty: 'medium', type: 'single', title: '以下哪个标准是信息安全管理体系的国际标准？', options: JSON.stringify(['A. ISO 9001', 'B. ISO 27001', 'C. ISO 14001', 'D. ISO 45001']), answer: JSON.stringify('B. ISO 27001'), explanation: 'ISO 27001是信息安全管理体系（ISMS）的国际标准。ISO 9001是质量管理，ISO 14001是环境管理，ISO 45001是职业健康安全管理。', tags: JSON.stringify(['ISO 27001', '标准']), score: 3 },
  ];

  const createdQuestions: any[] = [];
  for (const q of questions) {
    const created = await prisma.question.create({ data: q });
    createdQuestions.push(created);
  }
  console.log(`✅ Created ${createdQuestions.length} questions`);

  // ---- Contests ----
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Ongoing contest
  const ongoingContest = await prisma.contest.create({
    data: {
      title: '第三届网络安全知识竞赛',
      description: '本次竞赛包含50道理论题目，涵盖Web安全、密码学、逆向工程、Misc、网络安全基础、操作系统安全、安全法规与合规等分类。答题时间60分钟，答对得分，答错不扣分。同分按用时排序。',
      startTime: now,
      endTime: oneHourLater,
      duration: 60,
      totalScore: createdQuestions.reduce((sum, q) => sum + q.score, 0),
      status: 'ongoing',
      shuffleQuestions: true,
      shuffleOptions: true,
      contestQuestions: {
        create: createdQuestions.map((q, idx) => ({ questionId: q.id, sortOrder: idx })),
      },
    },
  });
  console.log(`✅ Created ongoing contest: ${ongoingContest.title}`);

  // Upcoming contest
  const upcomingContest = await prisma.contest.create({
    data: {
      title: '密码学专项赛',
      description: '密码学专项赛，包含密码学分类题目。答题时间45分钟。',
      startTime: oneDayLater,
      endTime: twoDaysLater,
      duration: 45,
      totalScore: createdQuestions.filter(q => q.category === '密码学').reduce((sum, q) => sum + q.score, 0),
      status: 'upcoming',
      shuffleQuestions: true,
      shuffleOptions: true,
      contestQuestions: {
        create: createdQuestions.filter(q => q.category === '密码学').map((q, idx) => ({ questionId: q.id, sortOrder: idx })),
      },
    },
  });
  console.log(`✅ Created upcoming contest: ${upcomingContest.title}`);

  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Summary:');
  console.log(`   Users: ${1 + users.length}`);
  console.log(`   Questions: ${createdQuestions.length}`);
  console.log(`   Contests: 2`);
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
