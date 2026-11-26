---
title: CS106L 02 · 序列容器（Sequence Containers）
date: 2026-11-26 11:00:00
tags: [CS106L, C++]
categories: [CS 自学, CS106L]
---

这是 CS106L 顺序容器部分的完整笔记（修订版）：概念梳理、代码示例，以及常见错误清单。

<!-- more -->


> 修订说明：★ = 新补充的内容，⚠️ = 原笔记里的错误已改正。
> 原笔记保留，只补不删，方便对照。

---


## 目录

- [1. 这一讲讲什么](#s1)
- [2. pair](#s2)
  - [2.1 是什么](#s3)
  - [2.2 为什么要它](#s4)
  - [2.3 结构化绑定（C++17）](#s5)
  - [2.4 pair 的缺点](#s6)
- [3. tuple](#s7)
- [4. struct](#s8)
  - [4.1 是什么](#s9)
  - [4.2 为什么说 struct 比 pair 好](#s10)
  - [4.3 struct 和 class 的区别](#s11)
  - [4.4 struct 能传引用](#s12)
  - [4.5 ★ 补充：vector 里能装 struct](#s13)
- [5. 统一初始化 {}](#s14)
  - [5.1 写法](#s15)
  - [5.2 ★ 补充：值怎么对应到字段](#s16)
  - [5.3 ⚠️ 最容易混的三行](#s17)
  - [5.4 局部变量不会自动清零](#s18)
- [6. stringstream 什么时候该用](#s19)
  - [6.1 三个适合的场景](#s20)
  - [6.2 一种不该用的场景](#s21)
  - [6.3 ★ 补充：现在更简单的类型转换](#s22)
  - [6.4 操纵器是什么](#s23)
  - [6.5 ⚠️ 修正：操纵器分三种](#s24)
  - [6.6 进制：hex / dec / oct](#s25)
  - [6.7 uppercase](#s26)
  - [6.8 flush](#s27)
- [7. STL 是什么](#s28)
  - [7.1 它提供什么](#s29)
  - [7.2 为什么要学 STL](#s30)
  - [7.3 ★ 补充：[begin, end) 的含义](#s31)
- [8. 容器的分类](#s32)
  - [什么叫"顺序容器"](#s33)
- [9. vector](#s34)
  - [9.1 是什么](#s35)
  - [9.2 取元素：两种写法](#s36)
  - [9.3 唯一的区别：越界时](#s37)
  - [9.4 什么时候该用 at()](#s38)
  - [9.5 ★ 补充：和 106B 的 Vector 对比](#s39)
  - [9.6 ★ 补充：size() 的坑](#s40)
- [10. deque](#s41)
  - [10.1 是什么](#s42)
  - [10.2 ⚠️ 修正：不是"比 vector 更快"，而是"头部插入比 vector 快"](#s43)
  - [10.3 代价：按下标访问会变慢](#s44)
  - [10.4 选择口诀](#s45)
- [11. 易错点汇总](#s46)
- [12. 速查表](#s47)
- [13. 自测](#s48)
- [14. 修订记录](#s49)
  - [真错误](#s50)
  - [补充内容](#s51)

<a id="s1"></a>
## 1. 这一讲讲什么

**讲的是 stream（流）之外的另一大类：容器。为下一讲的迭代器做铺垫。**

```
上一讲：流        → 怎么读写数据
这一讲：容器      → 怎么把数据装起来
下一讲：迭代器    → 怎么遍历容器（老师说是全课最重要的一讲）
```

**一句话：** 这一讲教你"**怎么把多个值打包**"和"**怎么用容器装一串值**"。

---

<a id="s2"></a>
## 2. `pair`

<a id="s3"></a>
### 2.1 是什么

**一个无名字的打包盒，固定装两个东西，两个可以是不同类型。**

```cpp
#include <utility>

std::pair<int, std::string> p = {7, "Alice"};

p.first;      // 7
p.second;     // "Alice"      ⚠️ 原笔记拼成了 seccond
```

<a id="s4"></a>
### 2.2 为什么要它

**因为 C++ 的函数只能 `return` 一个值。**

```cpp
std::pair<int, int> min_max(int a, int b) {
    if (a < b) return {a, b};
    return {b, a};
}
```

<a id="s5"></a>
### 2.3 结构化绑定（C++17）

**作用：把返回的 `pair` 或 `tuple` 一次性拆成多个变量。**

```cpp
auto [lo, hi] = min_max(5, 3);
// lo = 3, hi = 5
```

<a id="s6"></a>
### 2.4 `pair` 的缺点

```cpp
auto r = min_max(5, 3);
double x = r.first;    // 这是 min 还是 max？
double y = r.second;   // 也不知道
```

**想知道含义，只能：**
1. 找到 `min_max` 的实现
2. 看它 return 时是 `{a, b}` 还是 `{b, a}`
3. 记住哪个位置是 min

> 一旦函数被封装进库、或者签名没写清楚，调用方就只能猜。**编译器也帮不上忙。**

**`first` / `second` 不携带任何含义，读代码的人只能猜。**

> ⚠️ 老师特意提醒：**106B 的自动评分器用很老的 C++**，而且有些助教不熟悉结构化绑定，
> 所以 **106B 里别用**；**106L 用 C++20，放心用**。

---

<a id="s7"></a>
## 3. `tuple`

**装任意多个。**

`pair` 的加强版：想装几个就装几个，类型随便。

```cpp
#include <tuple>

std::tuple<int, double, std::string> t{1, 2.5, "hello"};

std::get<0>(t);     // 1
std::get<1>(t);     // 2.5
std::get<2>(t);     // "hello"
```

**和 `pair` 一样：`get<0>` 也不说明含义。**

| | `pair` | `tuple` |
|---|---|---|
| 装几个 | 固定 2 | 任意多个 |
| 取值 | `.first` / `.second` | `std::get<i>(t)` |
| 有名字吗 | ❌ | ❌ |

---

<a id="s8"></a>
## 4. `struct`

<a id="s9"></a>
### 4.1 是什么

**一个有名字的打包盒，每一格都有自己的名字。**

```cpp
struct PriceRange {
    double min;
    double max;
};

PriceRange p{1.5, 9.9};

std::cout << p.min;    // 1.5
std::cout << p.max;    // 9.9
```

<a id="s10"></a>
### 4.2 为什么说 `struct` 比 `pair` 好

| 对比项 | `pair` | `struct` |
|---|---|---|
| 装几个 | 固定 2 | 任意多个 |
| 类型不同 | ✅ | ✅ |
| 字段有名字 | ❌ | ✅ |
| 能自我说明 | ❌ | ✅ |
| 能随便加字段 | ❌ | ✅ |

```cpp
double a = r.first;    // ❌ 这是啥
double b = p.min;      // ✅ 一眼就懂
```

<a id="s11"></a>
### 4.3 `struct` 和 `class` 的区别

**`struct` 是 `class` 的轻量版，唯一区别：`struct` 里所有成员默认是 `public`。**

```cpp
struct Time {
    int hour;
    int minute;
};

struct Course {
    std::string code;
    Time start;
    Time end;
    std::vector<std::string> instructors;
};

Course c{"CS106L", {15, 30}, {17, 20}, {"Keith", "Anna"}};
//       ⚠️ 原笔记拼成了 Courss

std::cout << c.code;            // CS106L
std::cout << c.start.hour;      // 15
std::cout << c.instructors[0];  // Keith
```

<a id="s12"></a>
### 4.4 `struct` 能传引用

```cpp
void rename(Course& c) {    // 传引用：改的是原件
    c.code = "CS106L";
}
```

> 复习：不加 `&` = 改复印件；加 `&` = 改原件。

<a id="s13"></a>
### 4.5 ★ 补充：`vector` 里能装 `struct`

```cpp
std::vector<Course> courses;
courses.push_back({"CS106L", {15, 30}, {17, 20}, {"Keith", "Anna"}});

std::cout << courses[0].code;    // CS106L
```

**这是最常见的用法：一个 `vector`，每个元素是一个 `struct`。**

---

<a id="s14"></a>
## 5. 统一初始化 `{}`

<a id="s15"></a>
### 5.1 写法

```cpp
int x{5};
double d{3.14};
std::string s{"hello"};
std::vector<int> v{1, 2, 3};
Course c{"CS106L", {15, 30}, {17, 20}, {"Keith", "Anna"}};
```

**`{}` 只是给初始值，之后仍然可以改。**

```cpp
Course c{"CS106L", ...};
c.code = "CS106P";        // ✅ 可以改
```

<a id="s16"></a>
### 5.2 ★ 补充：值怎么对应到字段

**按 `struct` 里声明的顺序，一个一个对应。**

```cpp
struct Course {
    std::string code;                   // ← 第 1 个
    Time start;                         // ← 第 2 个
    Time end;                           // ← 第 3 个
    std::vector<std::string> teachers;  // ← 第 4 个
};

Course c{"CS106L", {15, 30}, {17, 20}, {"Keith", "Anna"}};
//        ↑1        ↑2         ↑3        ↑4
```

⚠️ 顺序写反了**不会报错**，只会把数据塞错位置。

<a id="s17"></a>
### 5.3 ⚠️ 最容易混的三行

```cpp
std::vector<int> a{3};    // 一个元素，值是 3      → size = 1
std::vector<int> b(3);    // 三个元素，都是默认值 0 → size = 3

std::vector<int> c[3];    // ⚠️ 这是「3 个 vector 组成的数组」
```

**逐行解释：**

| 写法 | 是什么 | size |
|---|---|---|
| `vector<int> a{3}` | 初始化列表：里面装一个 3 | 1 |
| `vector<int> b(3)` | 构造函数：要 3 个元素（默认 0） | 3 |
| `vector<int> c[3]` | **C 风格数组**：3 个空 vector | 每个都是 0 |

> ⚠️ 原笔记把 `c[3]` 说成"相当于二维数组"——**不准确**。
> 它是一个"装了 3 个 vector 的数组"，每个 vector 可以长度不同。
> **新手别用它**，要二维就用 `std::vector<std::vector<int>>`。

**口诀：**
> **大括号 = 装东西；小括号 = 传参数（这里是"要几个"）。**

<a id="s18"></a>
### 5.4 局部变量不会自动清零

```cpp
int x;      // ❌ 局部变量，值是垃圾
int y{};    // ✅ 显式零初始化，y = 0
```

| 变量种类 | 自动初始化吗 |
|---|---|
| 全局变量 | ✅ 会（零初始化） |
| 局部变量 | ❌ 不保证 |

---

<a id="s19"></a>
## 6. `stringstream` 什么时候该用

<a id="s20"></a>
### 6.1 三个适合的场景

| 场景 | 用什么 | 例子 |
|---|---|---|
| 处理 / 解析字符串 | `istringstream` | 拆文件路径、拆 CSV 一行 |
| 格式化输入输出 | `stringstream` + 操纵器 | `hex`、`uppercase`、`flush` |
| 字符串 ↔ 数字互转 | `stringstream` | `"42"` ↔ `42` |

<a id="s21"></a>
### 6.2 一种不该用的场景

**只是把几段字符串拼起来 → 用 `string` 自己的方法。**

```cpp
// ❌ 杀鸡用牛刀
std::ostringstream oss;
oss << "Hello, " << name;
std::string s = oss.str();

// ✅ 直接用
std::string s = "Hello, ";
s += name;              // 或 s.append(name);
```

<a id="s22"></a>
### 6.3 ★ 补充：现在更简单的类型转换

```cpp
int n = std::stoi("42");              // 字符串 → int
double d = std::stod("3.14");         // 字符串 → double
std::string s = std::to_string(42);   // int → 字符串
```

> 视频是 2019 年的，那时这些还不够普及。**现在优先用它们。**

<a id="s23"></a>
### 6.4 操纵器是什么

**你已经学过的 `setw`、`left`、`fixed`、`setprecision`——这四个全都是操纵器。**

```cpp
std::cout << std::hex << 255;   // ← std::hex 就是操纵器：把输出切成十六进制
```

**类比：**

> 打印机面板上有一排按钮：彩色/黑白、横向/纵向、双面/单面。
> 操纵器就是这些按钮——**按一下，后面的打印全按这个设置来**。

<a id="s24"></a>
### 6.5 ⚠️ 修正：操纵器分三种

原笔记写的是【共同特点：按下去就一直有效】，**不够准确**，应改成：

| 类型 | 有哪些 | 行为 |
|---|---|---|
| **状态型** | `hex` `dec` `oct`、`uppercase`、`fixed`、`left`/`right`、`setfill`、`setprecision` | **一直有效**，直到改回来 |
| **一次性** | `setw(n)` | **只管下一个输出** |
| **动作型** | `flush` | **执行一次动作**，不是状态 |

**想切回来，得再按另一个按钮：**

```cpp
std::cout << std::dec << 255;    // 切回十进制
std::cout << std::right;         // 切回右对齐
```

<a id="s25"></a>
### 6.6 进制：`hex` / `dec` / `oct`

```cpp
int x = 255;

std::cout << std::dec << x << "\n";   // 255   十进制
std::cout << std::hex << x << "\n";   // ff    十六进制
std::cout << std::oct << x << "\n";   // 377   八进制
```

**⚠️ 这三个是什么？**

| 代码 | 全称 | 中文 | 满几进一 | 符号 |
|---|---|---|---|---|
| `dec` | **dec**imal | 十进制 | 10 | 0–9 |
| `hex` | **hex**adecimal | 十六进制 | 16 | 0–9 + A–F |
| `oct` | **oct**al | 八进制 | 8 | 0–7 |

**同一个数 255，四种写法：**

```
十进制：  255
二进制：  11111111
八进制：  377      （3×64 + 7×8 + 7 = 255）
十六进制：FF       （15×16 + 15 = 255）
```

**十六进制的字母：** `A=10, B=11, C=12, D=13, E=14, F=15`（因为 0–9 只有 10 个符号，不够用）。

**为什么要十六进制：** 1 个十六进制位 = 4 个二进制位，**2 位 = 1 个字节（0–255）**，整齐。

<a id="s26"></a>
### 6.7 `uppercase`

**一般默认字母是小写；`uppercase` 把十六进制的字母变大写。**

```cpp
std::cout << std::hex << std::uppercase << 255 << "\n";     // FF
std::cout << std::hex << std::nouppercase << 255 << "\n";   // ff
```

**用在哪：** 颜色值（`#FF00AA`）、内存地址、哈希值。

**颜色是怎么来的：**

```cpp
int r = 255, g = 0, b = 170;

std::cout << "#" << std::hex << std::uppercase
          << std::setw(2) << std::setfill('0') << r     // FF
          << std::setw(2) << std::setfill('0') << g     // 00
          << std::setw(2) << std::setfill('0') << b     // AA
          << "\n";
// #FF00AA
```

| 操纵器 | 作用 |
|---|---|
| `std::setw(2)` | 下一个输出至少占 2 格 |
| `std::setfill('0')` | 不够 2 格时用 `0` 补（默认是空格） |

> 不补零的话，`g = 0` 会输出 `0`，颜色变成 `#FF0AA`，长度就错了。

**`setw` 是一次性的，`setfill` 一直有效。**

<a id="s27"></a>
### 6.8 `flush`

**`cout` 是有缓冲的**：它不是每打一个字符就去"麻烦"操作系统，
而是先攒在一个内存桶里（buffer），攒到一定量再统一送出去。

**为什么必须这样：**

```
每输出一个字符就调用一次系统 → 1 万次系统调用
攒够 4KB 再调用一次         → 几次系统调用
```

系统调用（syscall）很慢，比在内存里搬数据慢几百倍。**所有语言的标准输出都带缓冲。**

**`flush` 的作用：把缓冲倒掉，立刻输出。**

```cpp
std::cout << i << " " << std::flush;   // 每秒立刻出现一个数字
```

**`std::endl = '\n' + std::flush`**

| 写法 | 换行 | 刷新 | 速度 |
|---|---|---|---|
| `std::endl` | ✅ | ✅ | 慢一点 |
| `'\n'` | ✅ | ❌ | 快 |

**什么时候必须单独用 `flush`：**

| 场景 | 为什么 |
|---|---|
| 进度条（`\r` 不换行） | 不刷新屏幕就不动 |
| 长时间计算 | 想看到"跑到哪一步了" |
| 写日志，怕崩溃 | 崩溃时缓冲区内容会丢 |
| 输出重定向到文件 | 变成全缓冲，可能长时间不更新 |

---

<a id="s28"></a>
## 7. STL 是什么

**Standard Template Library，标准模板库。**（⚠️ 原笔记拼成了 TSL）

<a id="s29"></a>
### 7.1 它提供什么

**★ 补充：一共五个部件，视频里你只记了前三个。**

| 部件 | 中文 | 干什么 |
|---|---|---|
| containers | 容器 | 装东西的盒子（`vector`、`map`、`set`…） |
| iterators | 迭代器 | 指向盒子里某个位置的"手指" |
| algorithms | 算法 | 现成函数（`sort`、`find`…） |
| adapters | 适配器 | `stack`、`queue`（套在别的容器外） |
| functors / lambdas | 仿函数 / 匿名函数 | 传给算法的"小函数" |

<a id="s30"></a>
### 7.2 为什么要学 STL

#### ① 代码更短，更能表达"意图"

**老写法：**

```cpp
// 生成 20 个随机数
std::vector<int> v;
for (int i = 0; i < 20; ++i) {   // ⚠️ 原笔记拼成了 itn
    v.push_back(rand());
}

// 冒泡排序
for (int i = 0; i < v.size(); ++i) {
    for (int j = 0; j + 1 < v.size() - i; ++j) {
        if (v[j] > v[j + 1]) {
            int tmp = v[j];
            v[j] = v[j + 1];
            v[j + 1] = tmp;
        }
    }
}

// 打印
for (int i = 0; i < v.size(); ++i) {
    std::cout << v[i] << " ";
}
```

**约 20 行，要读很久才知道它在干什么。**

**STL 写法：**

```cpp
#include <algorithm>     // ⚠️ 原笔记拼成了 algorithnm
#include <iterator>

std::vector<int> v(20);
std::generate(v.begin(), v.end(), rand);    // 生成
std::sort(v.begin(), v.end());              // 排序
std::copy(v.begin(), v.end(),
          std::ostream_iterator<int>(std::cout, " "));   // 打印
```

**逐行解释：**

| 代码 | 意思 |
|---|---|
| `generate(起点, 终点, 函数)` | 对区间内每个位置调用函数填值 |
| `sort(起点, 终点)` | 把区间排序 |
| `copy(起点, 终点, 输出位置)` | 把区间复制到输出 |
| `ostream_iterator<int>(cout, " ")` | 一个"写到屏幕、用空格隔开"的输出器 |

**只有 5 行，而且每一行都能直接读出意图。**

#### ② 更快

**STL 里的实现，是全世界的人一起优化过的。**
你手写的冒泡是 O(n²)，`std::sort` 是 O(n log n)。

#### ③ 通用（可复用）

```cpp
std::sort(v.begin(), v.end());    // 对 vector
std::sort(d.begin(), d.end());    // 对 deque
std::sort(a, a + 100);            // 对普通数组
```

**算法不关心你用的是哪个容器，只要它提供"迭代器"这种统一接口。**
这就是"泛型"（generic programming）。

<a id="s31"></a>
### 7.3 ★ 补充：`[begin, end)` 的含义

```cpp
std::sort(v.begin(), v.end());
//        ↑            ↑
//     第一个元素    最后一个元素的「后一个」
```

```
 [10][20][30][40]
  ↑              ↑
begin           end（这里没有元素，只是终点线）
```

**STL 的区间约定是「左闭右开」：包含 begin，不包含 end。**

> 这也解释了为什么 `v.end()` 不是"最后一个元素"——下一讲会重点讲。

---

<a id="s32"></a>
## 8. 容器的分类

```
容器（container）
├── 顺序容器（sequence container）        ← 本次讲
│    vector、deque、array、list、forward_list（⚠️ 原笔记拼成了 foward_list）
├── 关联容器（associative container）     ← 后面讲
│    map、set、unordered_map、unordered_set
└── 容器适配器（container adapter）       ← 本讲提一下
     stack、queue、priority_queue
```

<a id="s33"></a>
### 什么叫"顺序容器"

**元素按位置排成一列，你可以"第几个"这样访问。**

```
vector：[10][20][30][40]
         0   1   2   3      ← 按下标访问
```

对比关联容器（后面才学）：

```
map:  "apple"  → 3
      "banana" → 5        ← 按 key 查，不是按位置
```

---

<a id="s34"></a>
## 9. `vector`

<a id="s35"></a>
### 9.1 是什么

**一个能自动变长的数组。**

| 特征 | 说明 |
|---|---|
| 连续存储 | 元素挨在一起，按下标访问极快 |
| 自动扩容 | 装满了会自动申请更大的空间 |
| 类型任意 | `int`、`string`、`struct`，甚至 `vector<vector<int>>` |

```cpp
std::vector<int> v;         // 空
v.push_back(10);            // [10]
v.push_back(20);            // [10, 20]
v.push_back(30);            // [10, 20, 30]
std::cout << v[1];          // 20
```

<a id="s36"></a>
### 9.2 取元素：两种写法

| 写法 | 含义 |
|---|---|
| `names[i]` | 取第 i 个（**不检查**） |
| `names.at(i)` | 取第 i 个（**带检查**） |

**只要索引合法（0 到 `size() - 1`），这两种写法结果完全一样。**

<a id="s37"></a>
### 9.3 唯一的区别：越界时

```cpp
std::vector<std::string> names{"Alice", "Bob"};   // size = 2，合法下标 0、1

names.at(2);   // → 抛异常，程序立刻停下，并告诉你"越界"
names[2];      // → 不报错，继续跑，但读到的是乱码，或者直接崩溃
```

| 写法 | 越界时 | 检查 |
|---|---|---|
| `at(i)` | 抛 `std::out_of_range` | ✅ |
| `[i]` | 未定义行为：乱码 / 崩溃 / 看起来正常 | ❌ |

**★ 补充：为什么 `[]` 不检查？**

> 为了性能：`at()` 多做一次"这个下标存不存在"的判断，`[]` 不做。
> C++ 的设计哲学是 **"相信程序员，不为你的错误买单"**。

**★ 补充：为什么越界有时候不崩？**

> 越界访问的是进程里的内存：
> - 撞到操作系统保护的区域 → **段错误**
> - 撞到一块没人用的内存 → **读到垃圾值，程序照跑**
>
> 这就是"未定义行为"最危险的地方：**它可能不报错。**

<a id="s38"></a>
### 9.4 什么时候该用 `at()`

```cpp
int idx;
std::cin >> idx;               // 用户可能输入 999
std::cout << names.at(idx);    // ✅ 越界会报错，而不是读乱码
```

**只要你自己保证下标合法，用 `[]` 完全没问题，而且这是最常见的写法。**

<a id="s39"></a>
### 9.5 ★ 补充：和 106B 的 `Vector` 对比

| 想干的事 | Stanford `Vector` | 标准 `std::vector` |
|---|---|---|
| 末尾加一个 | `v.add(x)` | `v.push_back(x)` |
| 取第 i 个（检查） | `v.get(i)` | `v.at(i)` |
| 取第 i 个（不检查） | `v[i]` | `v[i]` |
| 修改 | `v.set(i, x)` | `v[i] = x` |

<a id="s40"></a>
### 9.6 ★ 补充：`size()` 的坑

`size()` 返回的是**无符号数**（`size_t`）。

```cpp
for (int i = 0; i < v.size() - 1; ++i)   // ❌ v 为空时会下溢成巨大数
```

**安全写法：**

```cpp
for (int i = 0; i + 1 < v.size(); ++i)   // ✅
```

---

<a id="s41"></a>
## 10. `deque`

<a id="s42"></a>
### 10.1 是什么

**`deque` = double-ended queue = 双端队列（读作 "deck"）。**

**一个两头都能高效插入/删除的数组。**

```cpp
#include <deque>

std::deque<int> d;
d.push_back(2);      // [2]
d.push_front(1);     // [1, 2]
d.push_back(0);      // [1, 2, 0]      ⚠️ 原笔记没写结果

for (int x : d) std::cout << x << " ";   // 1 2 0
```

<a id="s43"></a>
### 10.2 ⚠️ 修正：不是"比 vector 更快"，而是"头部插入比 vector 快"

```cpp
vector<int> v;
v.push_front(1);    // ❌ 编译错误：vector 没有 push_front
```

**为什么 `vector` 慢：**

```
原数组：[a][b][c][d]
插入 x：[x][a][b][c][d]
             ↑
        a、b、c、d 全部要往后挪一格
```

**插入 1 个，要挪 n 个 → O(n)。**

**`deque` 为什么快：**

```
vector（一整块）：
[a][b][c][d]

deque（分段）：
[块1: a b] [块2: c d] [块3: e f]
             ↑
        有一张"块目录"指向这些块
```

**头部插入时，只要在前面加一个新块，不用搬动现有元素。**

> 老师的说法：它本质上是一个"存放定长数组的数组"（array of fixed-size arrays）。

<a id="s44"></a>
### 10.3 代价：按下标访问会变慢

| 操作 | `vector` | `deque` |
|---|---|---|
| `v[i]` / `d[i]` | 直接算地址，O(1) | 先查目录找块，再算偏移，O(1) 但常数更大 |
| 末尾插入 | 快 | 快 |
| 头部插入 | ❌ 没有此操作（`insert` 是 O(n)） | ✅ 快 |
| 内存连续性 | ✅ 完全连续 | ❌ 分段 |

**视频里的测速：**

| 测试 | 结果 |
|---|---|
| 头部插入 100 万个 | `vector` 呈二次方增长，`deque` 快约 200 倍 |
| 按下标访问 | `vector` 明显更快 |

<a id="s45"></a>
### 10.4 选择口诀

```
只在末尾加/删          → vector（默认就用它）
两头都要加/删          → deque
要在中间频繁插入/删除   → list（本讲没讲）
```

---

<a id="s46"></a>
## 11. 易错点汇总

| ❌ 错误 | ✅ 正确 | 为什么 |
|---|---|---|
| `p.seccond` | `p.second` | 拼写 |
| `vector<int> b[3]` 说是二维数组 | 是"3 个 vector 的数组" | 维度不保证一致 |
| `vector<int> a{3}` 以为是 3 个 0 | 是 1 个 3 | `{}` 优先匹配初始化列表 |
| `setprecision(2)` 单独用 | `fixed << setprecision(2)` | 单独用是有效数字 |
| 以为所有操纵器都一直有效 | `setw`、`flush` 是例外 | 一次性 / 动作型 |
| `v[99]` 以为会报错 | 不报错，未定义行为 | 为了性能不检查 |
| 说 deque 整体比 vector 快 | 只有头插快 | 随机访问更慢 |
| `v.size() - 1` 在空 vector 上 | 下溢成巨大数 | `size()` 是无符号数 |
| `endl` 当普通换行用 | `'\n'` 更快 | `endl` 带 flush |

---

<a id="s47"></a>
## 12. 速查表

| 我想干的事 | 写法 |
|---|---|
| 定义 struct | `struct A { int x; std::string y; };` |
| 用 `{}` 初始化 | `A a{1, "hi"};` |
| pair | `std::pair<int,int> p{1,2}; p.first;` |
| 结构化绑定 | `auto [a, b] = p;` |
| tuple 取值 | `std::get<0>(t)` |
| vector 末尾加 | `v.push_back(x)` |
| vector 取（快） | `v[i]` |
| vector 取（安全） | `v.at(i)` |
| vector 大小 | `v.size()` |
| deque 头插 | `d.push_front(x)` |
| 十六进制 | `std::hex` |
| 大写 | `std::uppercase` |
| 补零 | `setw(2) << setfill('0')` |
| 立刻刷新 | `std::flush` / `std::endl` |
| 排序 | `std::sort(v.begin(), v.end())` |

---

<a id="s48"></a>
## 13. 自测

1. `pair` 的三个局限是什么？
2. `struct` 和 `class` 的唯一区别？
3. `vector<int> a{3}` 和 `vector<int> b(3)` 的 size 分别是？
4. `v.at(10)` 和 `v[10]` 越界时分别会怎样？
5. 为什么 C++ 的 `[]` 不检查越界？
6. `vector` 的 `push_front` 为什么不存在？
7. `deque` 为什么头插快？代价是什么？
8. 什么时候该用 `flush`？
9. STL 的五个部件是什么？
10. 什么情况下不该用 `stringstream`？

---

<a id="s49"></a>
## 14. 修订记录

<a id="s50"></a>
### 真错误

| 位置 | 原文 | 改为 |
|---|---|---|
| pair | `p.seccond` | `p.second` |
| 统一初始化 | `Courss c{...}` | `Course c{...}` |
| 统一初始化 | `vector<int> b[3]` "相当于二维数组" | 说明它是"3 个 vector 的数组"，不建议新手用 |
| 操纵器 | "共同特点：一直有效" | 分状态型 / 一次性 / 动作型三种 |
| deque | "它为什么比 vector 更快" | "头部插入为什么比 vector 快"（随机访问反而更慢） |
| deque 示例 | 没写结果 | 补上 `1 2 0` |
| STL | `#include <algorithnm>` | `#include <algorithm>` |
| STL | `TSL` | `STL` |
| STL | `for(itn i...)` | `for(int i...)` |
| STL | 部件只列了 3 个 | 补全 5 个（加 adapters、functors/lambdas） |
| 容器 | `foward_list` | `forward_list` |

<a id="s51"></a>
### 补充内容

1. `struct` 放进 `vector` 的用法
2. `{}` 的值按声明顺序对应字段
3. 进制的基础解释（255 = FF = 377）
4. 颜色 `#FF00AA` 的完整推导
5. `at()` 抛异常 / `[]` 未定义行为 / 为什么有时候不崩
6. 与 106B `Vector` 的对应表
7. `size()` 无符号数下溢的坑
8. `[begin, end)` 左闭右开的约定
9. `stoi` / `to_string` 这类现代替代写法
10. 速查表 + 10 道自测题
