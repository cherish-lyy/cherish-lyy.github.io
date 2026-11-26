---
title: CS106L 01 · 流（Streams）
date: 2026-11-26 21:00:00
tags: [CS106L, C++]
categories: [CS 自学, CS106L]
---

这一篇是 CS106L 第一讲的完整笔记：四种流（cout / cin / ofstream / ifstream）、`>>` 的行为、`getline` 的坑、字符串流与格式化输出，以及 A1 作业里实际踩到的问题清单。

<!-- more -->

> 修订说明：★ = 新补充的内容，⚠️ = 原笔记里的错误已改正。
> 原笔记保留，只补不删，方便对照。

---


## 目录

- [1. 流是什么？](#s1)
- [2. 四种流](#s2)
  - [1) cout —— 输出到屏幕](#s3)
  - [2) cin —— 从键盘读](#s4)
  - [3) ofstream —— 写到文件](#s5)
  - [4) ifstream —— 从文件读](#s6)
  - [检查文件是否打开成功](#s7)
- [3. >> 到底怎么工作](#s8)
- [4. getline](#s9)
  - [经典问题：cin >> 之后接 getline](#s10)
- [5. istringstream 和 ostringstream](#s11)
  - [istringstream：把字符串拆开](#s12)
  - [ostringstream：把各种类型拼成字符串](#s13)
- [6. 格式化输出](#s14)
  - [setw(n) —— 管宽度](#s15)
  - [left / right —— 管对齐方向](#s16)
  - [setprecision + fixed —— 管小数位数](#s17)
  - [ios::app —— 往文件末尾追加](#s18)
- [7. ★ 新增：把流用在真实任务上（A1 的模式）](#s19)
- [8. ★ 新增：本主题常见错误清单](#s20)
- [9. ★ 新增：一页速查](#s21)
- [修订记录](#s22)
  - [真错误（会影响理解/编译）](#s23)
  - [笔误](#s24)
  - [补充内容（原笔记缺的）](#s25)

<a id="s1"></a>
## 1. 流是什么？

流是一条传送带，`<<` 是往传送带上放东西，`>>` 是从传送带上拿东西，上面跑的全是字符。

```
[你的程序] ═══ 传送带 ═══> [屏幕]       ← cout
[你的程序] ═══ 传送带 ═══> [文件]       ← ofstream
[键盘]     ═══ 传送带 ═══> [你的程序]   ← cin
[文件]     ═══ 传送带 ═══> [你的程序]   ← ifstream
```

**★ 补充：流的关键思想是「插头」**
同一套 `<<` / `>>` / `getline`，你接哪个流，就操作哪个设备。
所以学会 `cin` 之后，文件流几乎是免费的——只是换个插头。

---

<a id="s2"></a>
## 2. 四种流

<a id="s3"></a>
### 1) `cout` —— 输出到屏幕

把 `double` / `int` / `string` 转换成字符，送给屏幕。
比如 `20.02`，cout 送出去的是 `'2' '0' '.' '0' '2'`。

<a id="s4"></a>
### 2) `cin` —— 从键盘读

⚠️ **原笔记写「遇到空格就会停」，更准确的说法是：**

> `>>` 先**跳过前面的所有空白**（空格、Tab、换行），
> 然后开始读，**读到空白就停**。

所以输入 `notebook   7   2.5`（中间多个空格）也能正常读。

```cpp
std::string product;
int count = 0;
double price = 0.0;
std::cin >> product >> count >> price;
// product = "notebook"
// count   = 7
// price   = 2.5
```

`>>` 会把读到的值写进变量，原来是什么它不管（成功时是**覆盖**）：

```cpp
int count = 0;       // ① 先给它 0
std::cin >> count;   // ② 读到 7，把 0 覆盖成 7
```

**★ 补充：读失败时会怎样**
如果输入的不是数字（比如输入 `abc`），`>> count` 会**失败**：
- 变量要么不变、要么被置 0（C++11 起置 0）
- 流进入**失败状态**，后面的 `>>` 全部失效

这就是为什么要检查 `if (!in)`。

---

<a id="s5"></a>
### 3) `ofstream` —— 写到文件

需要 `#include <fstream>`

```cpp
std::ofstream out("文件名.txt");   // 打开（没有就创建，有就清空）
out << 内容;                       // 写
out.close();                       // 关闭
```

⚠️ **原笔记写的 `std::out<<内容;` 是错的。**
`std::out` 不存在，`out` 是你自己起的变量名：

```cpp
std::ofstream out("a.txt");
out << "hello";        // ✅
// std::out << ...     // ❌ 编译错误：std::out 不存在
```

**★ 补充：打开模式**

| 模式 | 意思 |
|---|---|
| 不写（默认） | 清空文件再写 |
| `std::ios::app` | 末尾追加 |
| `std::ios::trunc` | 明确表示清空（和默认一样） |

---

<a id="s6"></a>
### 4) `ifstream` —— 从文件读

```cpp
#include <fstream>

std::ifstream in("文件名.txt");
in >> 变量;          // 读「一个词」（遇空白停）
in.close();
```

⚠️ **原笔记只写了 `in >> 变量`，这会让你在 A1 里翻车。**
`>>` 只能读「一个词」，读不了带空格的整行。

**★ 补充：读文件有两种读法**

```cpp
// 读法 A：读「一个词」，遇空格/换行停
std::string word;
in >> word;

// 读法 B：读「一整行」，含空格
std::string line;
std::getline(in, line);
```

**★ 补充：读整个文件的标准写法**

```cpp
std::ifstream in("courses.csv");
if (!in) {                       // 必须先检查
    std::cerr << "打不开文件\n";
    return;
}

std::string line;
while (std::getline(in, line)) { // 读到文件尾自动停
    // 处理这一行
}
```

**为什么 `while (getline(...))` 能判断结束：**
`getline` 返回的是流对象，流能被转成 `bool`。
读成功 → 真；读到文件尾 → 假。

**★ 补充：`while (!in.eof())` 是坑**

```cpp
// ❌ 会多处理一次
while (!in.eof()) {
    std::getline(in, line);
    // 最后一次读失败，line 没更新，你却又处理了一遍
}
```

`eof()` 是**事后通知**（上一次读失败了），不是**事前预测**（还有没有内容）。

---

<a id="s7"></a>
### 检查文件是否打开成功

```cpp
std::ifstream in("test.txt");
if (!in) {
    std::cerr << "打不开文件" << std::endl;   // ⚠️ endl 要写 std::endl 或加 using namespace std
    return 1;                                  // ⚠️ 这句只能写在 main() 里
}
```

⚠️ 两个小修正：
1. `endl` 属于 `std`，要么写 `std::endl`，要么文件顶部有 `using namespace std;`
2. `return 1` 表示“程序异常结束”，只能出现在 `main()` 或返回 `int` 的函数里；
   在 `void` 函数里写 `return;` 就行。

---

<a id="s8"></a>
## 3. `>>` 到底怎么工作

`>>` 就是「格式化提取」，四个特点：

1. **跳过前面所有的空白**（空格、Tab、换行）
2. **按变量类型解释**（`int` 就找数字）
3. **遇到不匹配就停**
4. **没被消耗的字符会保留在流里**

```
输入：43   7
int a, b;
cin >> a >> b;      // a = 43, b = 7
```

```cpp
// 特点 4 的例子
// 输入：Hello world
std::string word;
std::cin >> word;   // word = "Hello"，"world" 还留在流里
std::cin >> word;   // 这次读到 "world"
```

---

<a id="s9"></a>
## 4. `getline`

读一整行，**包括空格**：

```cpp
std::string line;
std::getline(std::cin, line);
```

可以自定义分隔符：

```cpp
std::getline(std::cin, line, ',');
```

意思是：一直读到**逗号**为止，**逗号会被消耗掉**（读走但不存进字符串）。

```
输入：apple,banana
std::string a;
std::getline(std::cin, a, ',');   // a = "apple"
                                  // 下一次从 "banana" 开始读
```

<a id="s10"></a>
### 经典问题：`cin >>` 之后接 `getline`

```cpp
int age;
std::cin >> age;        // 输入 25 回车
std::string name;
std::getline(std::cin, name);   // ❌ name 会是空字符串
```

**为什么：** `cin >> age` 只吃掉 `25`，**换行符 `\n` 还留在流里**。
`getline` 一上来就看到 `\n`，立刻停止，于是拿到空串。

```cpp
std::cin >> age;
std::cin.ignore();              // ✅ 吃掉那个换行符
std::getline(std::cin, name);   // 正常读到名字
```

> ★ 补充：`ignore()` 默认只丢 **1 个**字符。如果前面还有空格残留，可以用
> `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');`
> 一次丢到换行为止（现在知道有这回事就行）。

---

<a id="s11"></a>
## 5. `istringstream` 和 `ostringstream`

内存里的流，不连接任何外部设备。

```
普通流：      程序 <==> 屏幕 / 键盘 / 文件
stringstream：程序 <==> 一段【字符串】
```

| 类 | 方向 | 作用 |
|---|---|---|
| `istringstream` | 字符串 → 程序 | 拆字符串 |
| `ostringstream` | 程序 → 字符串 | 拼字符串 |

<a id="s12"></a>
### `istringstream`：把字符串拆开

```cpp
#include <sstream>

std::istringstream iss("42 3.14 hello");

int a;
double b;
std::string c;
iss >> a >> b >> c;
// a = 42
// b = 3.14
// c = "hello"
```

**★ 补充：按逗号拆（A1 会用）**

`>>` 只认空白，遇到逗号不会停。要按任意分隔符拆，用 `getline`：

```cpp
std::istringstream iss("CS106L,3,2023-2024 Autumn");
std::string token;
while (std::getline(iss, token, ',')) {
    std::cout << "[" << token << "]\n";
}
// [CS106L]
// [3]
// [2023-2024 Autumn]
```

> 这就是 `utils.cpp` 里 `split` 函数的内部实现。

<a id="s13"></a>
### `ostringstream`：把各种类型拼成字符串

```cpp
#include <sstream>

std::ostringstream oss;
oss << " x = " << 42 << ", y = " << 3.14;
std::string result = oss.str();
// result = " x = 42, y = 3.14"
```

⚠️ 原笔记「把流里攒法人所有字符」→ 应为「把流里**攒下的**所有字符」。

`.str()` 的作用：把流里攒下的字符取出来，变成一个 `std::string`。

---

<a id="s14"></a>
## 6. 格式化输出

<a id="s15"></a>
### `setw(n)` —— 管宽度

`setw` = **set width**，设置宽度：**紧跟在它后面的那一个输出占几格**。

```cpp
#include <iomanip>

// 不加 setw
std::cout << "Alice" << 90 << std::endl;      // Alice90

// 加 setw
std::cout << std::setw(10) << "Alice"
          << std::setw(5)  << 90 << std::endl;
```

输出：

```
     Alice   90
```

- `setw(10) << "Alice"`：给 “Alice”（5 个字母）留 10 格，默认靠右 → 左边补 5 个空格
- `setw(5) << 90`：给 “90”（2 个字符）留 5 格 → 左边补 3 个空格

**★ 补充：`setw` 不会截断**

如果内容比格子宽，它会**撑破格子**，一个字符都不砍：

```cpp
std::cout << "[" << std::setw(3) << "Alice" << "]";
// [Alice]      ← 没有截断
```

**★ 补充：`setw` 是一次性的**

```cpp
std::cout << std::setw(5) << "a" << "b";   // a 占 5 格，b 不受影响
```

<a id="s16"></a>
### `left` / `right` —— 管对齐方向

名字靠左，数字靠右。

| 写法 | 效果 | 像什么 |
|---|---|---|
| （不写） | 靠右，空格补左边 | 数字习惯 |
| `left` | 靠左，空格补右边 | 名字习惯 |
| `right` | 手动切回靠右 | 和默认一样 |

```cpp
std::cout << std::setw(10) << "Alice" << "|" << std::endl;
//      Alice|

std::cout << std::left;
std::cout << std::setw(10) << "Alice" << "|" << std::endl;
// Alice     |
```

**要点：`setw` 是一次性的，`left` 是「一直开着」的。**

- `setw(10)` → 只对下一个输出有效
- `left` → 从写下的那一刻起全部靠左，直到你写 `right`

---

<a id="s17"></a>
### `setprecision` + `fixed` —— 管小数位数

| 写法 | 意思 |
|---|---|
| `fixed` | 按普通小数显示，不用科学计数法 |
| `setprecision(n)` | **配合 `fixed` 时**：小数点后留 n 位 |

```cpp
std::cout << std::fixed << std::setprecision(2) << 3.14159;   // 3.14
```

⚠️ **原笔记两处拼写错误：`seprecison` → `setprecision`**

⚠️ **概念修正（重要）：单独用 `setprecision(n)` ≠ 小数位数**

```cpp
std::cout << std::setprecision(3) << 3.14159265;   // 3.14
std::cout << std::setprecision(3) << 1234.5678;    // 1.23e+03  ← 变科学计数法
```

单独用时它表示「**总共保留 n 位有效数字**」，大数字会被改成科学计数法。
**所以永远和 `fixed` 一起用。**

**特点：**

| 特点 | 说明 |
|---|---|
| 会四舍五入 | 3.14159 保留 2 位 → 3.14；保留 4 位 → 3.1416 |
| 会「一直开着」 | 和 `left` 一样，写一次后面全生效 |
| `fixed` 也会「一直开着」 | 想关掉要写 `std::defaultfloat` |

---

<a id="s18"></a>
### `ios::app` —— 往文件末尾追加

`ofstream` 打开文件时，**默认会把原文件清空**。

```cpp
#include <fstream>

std::ofstream out("log.txt");      // 默认：清空重写
out << "hello\n";
out.close();
```

跑三次，文件里始终只有 **1 行**——每次打开都先清空。

```cpp
std::ofstream out("log.txt", std::ios::app);   // 追加
out << "hello\n";
out.close();
```

跑三次，文件里变成 **3 行**。

**★ 补充：三点注意**

1. 文件不存在时**会自动创建**（两种模式都是）
2. 每行末尾要自己写 `'\n'`，流不会帮你换行
3. `ios::app` 是 `ofstream` 的东西，**`ifstream` 用不到**

---

<a id="s19"></a>
## 7. ★ 新增：把流用在真实任务上（A1 的模式）

**读文件 → 切字段 → 存进结构体**

```cpp
struct Course {
    std::string title;
    std::string units;
    std::string quarter;
};

std::ifstream in("courses.csv");
if (!in) { std::cerr << "打不开\n"; return; }

std::string line;
std::getline(in, line);              // 跳过表头

while (std::getline(in, line)) {      // 一行一行读
    std::istringstream iss(line);     // 把这一行变成流
    std::string token;
    Course c;
    std::getline(iss, c.title, ',');
    std::getline(iss, c.units, ',');
    std::getline(iss, c.quarter);     // 最后一个不用分隔符
    courses.push_back(c);
}
```

**写文件：**

```cpp
std::ofstream out("student_output/out.csv");
out << "Title,Number of Units,Quarter\n";   // 表头 + 换行
for (const Course& c : courses) {
    out << c.title << ',' << c.units << ',' << c.quarter << '\n';
}
```

**两把刀，各切各的：**

| 目的 | 用什么 |
|---|---|
| 按「行」切 | `getline(in, line)` |
| 按「逗号」切 | `getline(iss, token, ',')` 或 `split(line, ',')` |

> 一行里有多个逗号，所以「逗号」和「换行」不是同一个频率，必须分两次切。

---

<a id="s20"></a>
## 8. ★ 新增：本主题常见错误清单

| # | 错误 | 正确 |
|---|---|---|
| 1 | `std::out << 内容` | `out << 内容`（`out` 是自己起的变量名） |
| 2 | 用 `ofstream` 读文件 | 读用 `ifstream` |
| 3 | 文件流用 `ios::app` | 读文件不需要模式参数 |
| 4 | `in >> line` 想读整行 | `std::getline(in, line)` |
| 5 | `getline(in, line, ',')` 当读行 | 只写 `getline(in, line)` |
| 6 | `while (!in.eof())` | `while (std::getline(in, line))` |
| 7 | `setprecision(2)` 单独用 | `fixed << setprecision(2)` |
| 8 | 输出忘写 `'\n'` | 每条记录末尾加 `'\n'` |
| 9 | `cin >> a` 后直接 `getline` | 先 `cin.ignore()` |
| 10 | `endl` / `getline` 忘加 `std::` | `std::endl` / `std::getline` |

---

<a id="s21"></a>
## 9. ★ 新增：一页速查

```cpp
#include <iostream>   // cin, cout, cerr
#include <fstream>    // ifstream, ofstream
#include <sstream>    // istringstream, ostringstream
#include <iomanip>    // setw, setprecision, fixed, left, right
#include <string>

// ---------- 输入 ----------
std::cin >> x;                       // 读一个词/一个数
std::getline(std::cin, line);        // 读一整行（先 ignore 掉残留换行）

// ---------- 文件 ----------
std::ifstream in("a.csv");           // 读
std::ofstream out("b.csv");          // 写（清空）
std::ofstream app("c.txt", std::ios::app);  // 追加
if (!in) { ... }                     // 必须检查
while (std::getline(in, line)) { }   // 读整个文件

// ---------- 字符串流 ----------
std::istringstream iss(line);        // 字符串 → 拆
iss >> a >> b;                       // 按空白拆
std::getline(iss, token, ',');       // 按逗号拆
std::ostringstream oss;              // 程序 → 拼
oss << a << "," << b;
std::string s = oss.str();

// ---------- 格式化 ----------
std::cout << std::setw(10) << "Alice" << std::setw(5) << 90 << '\n';
std::cout << std::left;              // 左对齐（一直有效）
std::cout << std::right;             // 右对齐
std::cout << std::fixed << std::setprecision(2) << 3.14159;
```

---

<a id="s22"></a>
## 修订记录

<a id="s23"></a>
### 真错误（会影响理解/编译）

| 位置 | 原文 | 改为 |
|---|---|---|
| §2 ofstream | `std::out<<内容;` | `out<<内容;`（`std::out` 不存在） |
| §6 setprecision | 「setprecision(n) 小数点后留 n 位」 | 单独用是**有效数字**，配 `fixed` 才是小数位 |
| §6 | `seprecison`（两处） | `setprecision` |
| §2 检查文件 | `endl` | `std::endl`（或 `using namespace std;`） |
| §2 检查文件 | `return 1;` 写在通用片段里 | 说明它只能在 `main()` 用 |

<a id="s24"></a>
### 笔误

| 原文 | 改为 |
|---|---|
| 讲 double / int / string 转换成字符 | **将** double / int / string 转换成字符 |
| 把流里攒法人所有字符 | 把流里**攒下的**所有字符 |
| `...<<90<<endl;>` | 去掉多余的 `>` |

<a id="s25"></a>
### 补充内容（原笔记缺的）

1. `in >>` 只能读一个词，读整行必须 `getline` —— **A1 的关键**
2. `while (getline(in, line))` 读整个文件 + `eof()` 为什么不能用
3. `istringstream` 按逗号拆（`getline(iss, token, ',')`）—— `split` 的原理
4. `setw` 不截断、`setw` 一次性
5. `fixed` 也会粘住，关闭用 `defaultfloat`
6. `ios::app` 只属于 `ofstream`
7. 第 7 节：流在真实任务里的完整套路（A1 模式）
8. 第 8 节：常见错误清单
9. 第 9 节：一页速查
