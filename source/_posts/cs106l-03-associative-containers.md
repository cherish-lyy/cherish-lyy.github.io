---
title: CS106L 03 · 容器适配器与关联容器
date: 2026-11-26 12:00:00
tags: [CS106L, C++]
categories: [CS 自学, CS106L]
---

这是 CS106L 容器适配器与关联容器部分的完整笔记（修订版）：stack / queue / priority_queue 与 map / set 的用法和常见错误。

<!-- more -->


> 修订说明：★ = 新补充的内容，⚠️ = 原笔记里的错误已改正。
> 原笔记保留，只补不删，方便对照。
> ⚠️ 原标题写的是 "Sequence Containers"，但这一讲的内容是「容器适配器 + 关联容器」，标题已更正。

---


## 目录

- [1. 回忆容器](#s1)
- [2. 容器适配器（adapter）：stack / queue](#s2)
  - [2.1 stack —— 栈](#s3)
  - [2.2 queue —— 队列](#s4)
  - [2.3 为什么叫"适配器"](#s5)
  - [2.4 能不能换底层容器](#s6)
  - [2.5 ★ 补充：常见坑](#s7)
- [3. 关联容器（associative）：map / set](#s8)
  - [3.1 是什么](#s9)
  - [3.2 类比](#s10)
  - [3.3 四种关联容器](#s11)
- [4. map 基本用法](#s12)
  - [4.1 插入 / 修改](#s13)
  - [4.2 删除 / 大小](#s14)
- [5. ⭐ 重点：[] / at / count / find 对比](#s15)
  - [5.1 为什么 [] 会自动创建](#s16)
  - [5.2 [] 的坑](#s17)
- [6. 正确的"查在不在"](#s18)
  - [6.1 count](#s19)
  - [6.2 find](#s20)
  - [6.3 contains（C++20）](#s21)
- [7. 为什么 count 只能返回 0 或 1](#s22)
- [8. 遍历 map](#s23)
  - [8.1 用 pair](#s24)
  - [8.2 结构化绑定（更短）](#s25)
  - [8.3 遍历顺序](#s26)
- [9. set](#s27)
  - [9.1 是什么](#s28)
  - [9.2 ★ 补充：常用操作](#s29)
  - [9.3 ★ 补充：set 和 map 的对应关系](#s30)
  - [9.4 ★ 补充：用 set 去重](#s31)
- [10. ★ 补充：有序 vs 无序](#s32)
- [11. ★ 补充：自定义类型能不能当 key](#s33)
- [12. ★ 补充：计数套路（超常用）](#s34)
- [13. 易错点汇总](#s35)
- [14. 速查表](#s36)
- [15. 自测](#s37)
- [16. 修订记录](#s38)
  - [真错误](#s39)
  - [补充内容](#s40)

<a id="s1"></a>
## 1. 回忆容器

```
容器
├── 顺序容器（sequence）      vector、deque、array、list
├── 容器适配器（adapter）     stack、queue、priority_queue   ★ 补上 priority_queue
└── 关联容器（associative）   map、set、unordered_map、unordered_set
```

**★ 补充：三类的本质区别**

| 类型 | 一句话 | 能不能按下标 |
|---|---|---|
| 顺序容器 | 按位置排成一列 | ✅ |
| 容器适配器 | 套在别的容器外面的"壳" | ❌ |
| 关联容器 | 按 key 存 | ❌ |

---

<a id="s2"></a>
## 2. 容器适配器（adapter）：`stack` / `queue`

<a id="s3"></a>
### 2.1 `stack` —— 栈

⚠️ **原笔记写"后进后出"，应为「后进先出（LIFO）」**：

> **最后放进去的，最先拿出来。**

```cpp
#include <stack>

std::stack<int> s;

s.push(1);
s.push(2);
s.push(3);          // 3 在最上面

std::cout << s.top();   // 3
s.pop();                // 拿走 3
std::cout << s.top();   // 2

s.size();               // 2
s.empty();              // 是不是空的
```

**图示：**

```
         ┌─────┐
push →   │  3  │  ← top（只能从这里进出）
         ├─────┤
         │  2  │
         ├─────┤
         │  1  │
         └─────┘
```

**★ 补充：`pop()` 不返回值**

```cpp
int x = s.pop();    // ❌ 编译错误（pop 返回 void）
```

正确写法：

```cpp
int x = s.top();    // ✅ 先取
s.pop();            // ✅ 再删
```

<a id="s4"></a>
### 2.2 `queue` —— 队列

**先进先出（FIFO）。**

```cpp
#include <queue>

std::queue<int> q;

q.push(1);
q.push(2);
q.push(3);

std::cout << q.front();   // 1
std::cout << q.back();    // 3
q.pop();                  // 拿走队头 1
std::cout << q.front();   // 2
```

**图示：**

```
push →  [ 1 ][ 2 ][ 3 ]  → pop
          ↑              ↑
        front           back
```

<a id="s5"></a>
### 2.3 为什么叫"适配器"

**`std::stack` 的底层默认使用 `std::deque`。**

```
stack = deque + 只能用 push_back / pop_back
queue = deque + 只能尾进、头出
```

**类比：**

> 你有一个"万能遥控器"（`deque`），上面几百个按钮。
> 适配器就是给这个遥控器**套一个壳，只露出 3 个按钮**。

**所以叫"适配器"——它不是新的容器，是把已有容器"改造"成特定用途。**

**★ 补充：为什么不直接用 `deque`？**

| 理由 | 说明 |
|---|---|
| **表达意图** | `stack` 一眼看出"后进先出"，`deque` 看不出来 |
| **防止误用** | `stack` 不提供中间插入，你不可能写出慢操作 |
| **接口更小** | 只用最快的几种操作（都是 O(1)） |

<a id="s6"></a>
### 2.4 能不能换底层容器

可以。

```cpp
#include <stack>          // ⚠️ 原笔记拼成了 #iclude
#include <vector>

std::stack<int> s1;                       // 默认：底层 deque
std::stack<int, std::vector<int>> s2;     // 指定：底层 vector
```

**要求：底层容器必须提供 `back()`、`push_back()`、`pop_back()`。**

<a id="s7"></a>
### 2.5 ★ 补充：常见坑

| ❌ 错误 | ✅ 正确 | 原因 |
|---|---|---|
| `for (int x : s)` 遍历 stack | 不支持 | `stack`/`queue` **没有迭代器** |
| `s[0]` 取元素 | `s.top()` | 没有下标 |
| `q.pop()` 以为删队尾 | 删的是**队头** | FIFO |
| `int x = q.pop();` | `int x = q.front(); q.pop();` | `pop()` 返回 `void` |

---

<a id="s8"></a>
## 3. 关联容器（associative）：`map` / `set`

<a id="s9"></a>
### 3.1 是什么

**关联容器"没有序列的概念"，你不能用 0 1 2 3 下标访问，它存的是 key-value 对。**

| | 顺序容器 | 关联容器 |
|---|---|---|
| 怎么存 | 按位置排成一列 | 按 key 存 |
| 怎么取 | `v[0]` | `m["Alice"]` |
| 有"第几个"吗 | ✅ | ❌ |
| 有序吗 | 按插入顺序 | **按 key 自动排序** |

<a id="s10"></a>
### 3.2 类比

| 容器 | 类比 |
|---|---|
| `vector` | 一排编号储物柜 |
| `map` | 一本字典（按词找解释） |
| `set` | 一个花名册（只关心"在不在"） |

<a id="s11"></a>
### 3.3 四种关联容器

| 类型 | 存什么 | 有序吗 | 底层 |
|---|---|---|---|
| `std::map` | key → value | 按 key 排序 | 平衡二叉搜索树 |
| `std::set` | 只有 key | 排序 | 平衡二叉搜索树 |
| `std::unordered_map` | key → value | 无序 | 哈希表 |
| `std::unordered_set` | 只有 key | 无序 | 哈希表 |

---

<a id="s12"></a>
## 4. `map` 基本用法

```cpp
#include <map>

std::map<std::string, int> age;                        // 名字 → 年龄
std::map<std::string, std::set<std::string>> sponsors;  // 车队 → 赞助商集合
```

<a id="s13"></a>
### 4.1 插入 / 修改

```cpp
age["Alice"] = 20;
age["Bob"]   = 22;        // ⚠️ 原笔记拼成了 "BOb"
```

```cpp
std::cout << age["Alice"];    // 20      ⚠️ 原笔记注释写成 21，与上一行不符
std::cout << age.at("Bob");   // 22
```

**键已存在时再赋值 = 覆盖：**

```cpp
age["Alice"] = 21;
std::cout << age["Alice"];    // 21
```

<a id="s14"></a>
### 4.2 删除 / 大小

```cpp
age.erase("Bob");   // 删除
age.size();         // 1
age.empty();        // false
```

---

<a id="s15"></a>
## 5. ⭐ 重点：`[]` / `at` / `count` / `find` 对比

| 写法 | 键存在 | 键不存在 | 能用在 `const map` 上吗 |
|---|---|---|---|
| `m[key]` | 返回 value | **自动创建**，值默认初始化（一般为 0），再返回 | ❌ 不能 |
| `m.at(key)` | 返回 value | **抛 `out_of_range` 异常** | ✅ 能 |
| `m.count(key)` | 返回 1 | 返回 0 | ✅ 能 |
| `m.find(key)` | 返回指向它的迭代器 | 返回 `m.end()` | ✅ 能 |

<a id="s16"></a>
### 5.1 为什么 `[]` 会自动创建

为了让计数写法成立：

```cpp
std::map<std::string, int> times;

times["Pirelli"]++;    // 不存在 → 先建一个 0 → 再 ++ → 1
times["Pirelli"]++;    // 已存在 → 直接 ++ → 2
```

<a id="s17"></a>
### 5.2 `[]` 的坑

```cpp
if (age["Charlie"] > 0) { ... }   // ❌ 顺手把 Charlie 插进 map 了
```

**★ 补充：`const map` 为什么不能用 `[]`**

因为 `[]` 可能**新增元素**，而 `const` 不允许修改容器。

```cpp
void f(const std::map<std::string, int>& m) {
    m["x"];     // ❌ 编译错误
    m.at("x");  // ✅（不存在会抛异常）
    m.count("x"); // ✅
}
```

---

<a id="s18"></a>
## 6. 正确的"查在不在"

<a id="s19"></a>
### 6.1 `count`

**存在返回 1，否则返回 0。**

```cpp
if (age.count("Alice")) {
    // 存在
}
```

<a id="s20"></a>
### 6.2 `find`

```cpp
if (age.find("Alice") != age.end()) {
    // 存在
}
```

<a id="s21"></a>
### 6.3 `contains`（C++20）

```cpp
if (age.contains("Alice")) {
    // 存在      // 需要 -std=c++20
}
```

> ✅ 原笔记的三个例子都对，这里只补一句：
> **`count` 和 `find` 效果一样，`find` 略快**（`count` 内部就是用 `find` 实现的）。

---

<a id="s22"></a>
## 7. 为什么 `count` 只能返回 0 或 1

**因为 `map` 和 `set` 的键不能重复。**

**★ 补充：`multimap` / `multiset` 允许同一个键出现多次。**

```cpp
#include <map>

std::multimap<std::string, int> mm;

mm.insert({"apple", 1});
mm.insert({"apple", 2});

mm.count("apple");    // 2  ← 这里就可以返回 > 1
```

**★ 补充：`multimap` 的三个特点**

| 特点 | 说明 |
|---|---|
| 没有 `[]` | 同一个 key 有多个 value，不知道该返回哪个 |
| 用 `insert({key, value})` | 插入一对 |
| `count` 可以 > 1 | 这正是它存在的意义 |

---

<a id="s23"></a>
## 8. 遍历 `map`

<a id="s24"></a>
### 8.1 用 `pair`

```cpp
for (const auto& entry : age) {
    std::cout << entry.first << " = " << entry.second << '\n';
    // ⚠️ 原笔记写成了 << '\n;  —— 少了一个引号
}
```

- `entry.first` → key
- `entry.second` → value

<a id="s25"></a>
### 8.2 结构化绑定（更短）

```cpp
for (const auto& [name, years] : age) {
    std::cout << name << " = " << years << '\n';
}
```

<a id="s26"></a>
### 8.3 遍历顺序

**底层是二叉搜索树，所以天然有序——按 key 排序，不是插入顺序。**

```cpp
std::map<std::string, int> m;
m["Charlie"] = 3;
m["Alice"]   = 1;
m["Bob"]     = 2;

for (const auto& [k, v] : m) std::cout << k << " ";
// Alice Bob Charlie
```

---

<a id="s27"></a>
## 9. `set`

<a id="s28"></a>
### 9.1 是什么

**只有键、没有值的 `map`。**

```cpp
#include <set>

std::set<std::string> names;
names.insert("Alice");
names.insert("Bob");
names.insert("Alice");     // ★ 重复，无效

names.size();              // 2
```

**set 无重复元素且有序。**

<a id="s29"></a>
### 9.2 ★ 补充：常用操作

```cpp
std::set<int> s{3, 1, 2};

s.insert(4);      // 加一个
s.erase(1);       // 删一个
s.count(2);       // 在不在：1 / 0
s.size();         // 3
s.empty();        // 空不空

for (int x : s) std::cout << x << " ";   // 2 3 4  ← 自动排序
```

<a id="s30"></a>
### 9.3 ★ 补充：`set` 和 `map` 的对应关系

| `map` | `set` |
|---|---|
| `m[key] = value` | `s.insert(key)` |
| `m.count(key)` | `s.count(key)` |
| `m.erase(key)` | `s.erase(key)` |
| 遍历得到 `pair` | 遍历得到**元素本身** |

> 老师说：**把 `set` 想成一个 `map`，它的 value 是隐式的 `true`/`false`。**

<a id="s31"></a>
### 9.4 ★ 补充：用 `set` 去重

```cpp
std::vector<std::string> v{"a", "b", "a", "c", "b"};
std::set<std::string> uniq(v.begin(), v.end());
// {"a", "b", "c"}
```

---

<a id="s32"></a>
## 10. ★ 补充：有序 vs 无序

| | `map` / `set` | `unordered_map` / `unordered_set` |
|---|---|---|
| 底层 | 平衡二叉搜索树（红黑树） | 哈希表 |
| 是否排序 | ✅ 按 key 排 | ❌ 不保证 |
| 单次查找 | O(log n) | **平均 O(1)** |
| 遍历 | 有序 | 顺序随机 |
| 内存 | 更省 | 通常更费 |

**什么时候用哪个：**

```
要按顺序遍历 / 按范围查找  → map / set
要单点查找最快            → unordered_ 版本
数据量小                  → 用 map 更省心
```

```cpp
#include <unordered_map>

std::unordered_map<std::string, int> freq;
freq["apple"] = 3;

for (const auto& [k, v] : freq) {
    // 顺序不确定
}
```

---

<a id="s33"></a>
## 11. ★ 补充：自定义类型能不能当 key

**能，但必须能"比较大小"**（因为底层是二叉搜索树）。

```cpp
struct Student {
    std::string name;
    int id;
};

bool operator<(const Student& a, const Student& b) {
    return a.id < b.id;
}

std::set<Student> students;    // ✅ 现在可以用了
```

**`unordered_set` 的要求不同**：需要哈希函数，后面讲类时再说。

---

<a id="s34"></a>
## 12. ★ 补充：计数套路（超常用）

**场景：找出"出现超过一次"的东西。**

```cpp
std::map<std::string, int> times;      // ① 准备计数板

for (每个东西) {
    times[那个东西]++;                  // ② 出现一次 +1
}

for (const auto& entry : times) {       // ③ 按次数筛
    if (entry.second > 1) {
        // entry.first 就是"出现了不止一次"的那个
    }
}
```

**完整例子：词频统计**

```cpp
#include <iostream>
#include <map>
#include <string>
#include <sstream>

int main() {
    std::string text = "apple banana apple cherry banana apple";

    std::map<std::string, int> freq;

    std::istringstream iss(text);
    std::string word;
    while (iss >> word) {
        freq[word]++;
    }

    for (const auto& [w, c] : freq) {
        std::cout << w << ": " << c << "\n";
    }
}
```

**输出：**

```
apple: 3
banana: 2
cherry: 1
```

---

<a id="s35"></a>
## 13. 易错点汇总

| ❌ 错误 | ✅ 正确 | 为什么 |
|---|---|---|
| 说 stack 是"后进后出" | **后进先出（LIFO）** | 最后进的先出 |
| `int x = s.pop();` | `x = s.top(); s.pop();` | `pop()` 返回 `void` |
| 用范围 for 遍历 `stack`/`queue` | 不支持 | 它们没有迭代器 |
| `m[0]` 想取第一个 | 范围 for / 迭代器 | map 没有位置下标 |
| `if (m["x"])` 查存在 | `m.count("x")` | `[]` 会偷偷插入 |
| `const map` 用 `[]` | `at()` / `count()` / `find()` | `[]` 可能修改容器 |
| `s += "x"` 往 set 加 | `s.insert("x")` | `+=` 是 string 的 |
| 以为 map 遍历是插入顺序 | 按 key 排序 | 底层是二叉搜索树 |
| 用 set 统计次数 | 用 `map<X,int>` | set 会去重，数不出来 |
| `multimap` 用 `[]` | `insert({k, v})` | 一个 key 可能有多个值 |
| 自定义类型直接放 set | 先定义 `operator<` | 树需要比较大小 |

---

<a id="s36"></a>
## 14. 速查表

| 我想干的事 | 写法 |
|---|---|
| 栈：放 / 取 / 看 | `push(x)` / `pop()` / `top()` |
| 队列：放 / 取 / 看 | `push(x)` / `pop()` / `front()` |
| 声明 map | `std::map<K, V> m;` |
| 插入 / 修改 | `m[key] = value;` |
| 安全访问 | `m.at(key)` |
| 判断存在 | `m.count(key)` / `m.find(key) != m.end()` |
| 删除 | `m.erase(key)` |
| 遍历 | `for (const auto& [k, v] : m)` |
| 声明 set | `std::set<T> s;` |
| set 插入 | `s.insert(x)` |
| 无序版本 | `std::unordered_map` / `std::unordered_set` |
| 计数 | `m[x]++` |

---

<a id="s37"></a>
## 15. 自测

1. `stack` 和 `queue` 的取出顺序分别是什么？
2. 为什么 `stack` 叫"适配器"？底层默认是什么？
3. 为什么 `pop()` 不返回值？怎么正确取出并删除？
4. `map` 和 `vector` 的取元素方式有什么本质区别？
5. `m["不存在"]` 做了什么？为什么这既是优点也是坑？
6. `const map` 为什么不能用 `[]`？三种替代写法？
7. `count` 为什么只返回 0 或 1？什么容器下可以 > 1？
8. 遍历 `map` 得到的元素是什么？怎么取 key 和 value？
9. `map` 的遍历顺序是什么？为什么？
10. `set` 和 `map` 的关系是什么？
11. 什么时候用 `unordered_map`？
12. 自定义类型放进 `set` 需要定义什么？

---

<a id="s38"></a>
## 16. 修订记录

<a id="s39"></a>
### 真错误

| 位置 | 原文 | 改为 |
|---|---|---|
| 2.1 stack | "后进后出" | **后进先出（LIFO）** |
| 2.4 | `#iclude <stack>` | `#include <stack>` |
| 4.1 | `age["BOb"]` | `age["Bob"]` |
| 4.1 | 赋值 20，注释却写 `// 21` | 改为 `// 20`，另起一行演示覆盖 |
| 8.1 | `<< '\n;` | `<< '\n';` |
| 标题 | "Sequence Containers" | **容器适配器与关联容器** |

<a id="s40"></a>
### 补充内容

1. `priority_queue` 补进容器分类
2. `pop()` 不返回值、`stack`/`queue` 没有迭代器
3. 为什么用适配器而不是直接用 `deque`（三个理由）
4. `const map` 不能用 `[]` 的原因
5. `multimap` / `multiset` 的用法与 `insert({k,v})`
6. `set` 的常用操作、与 `map` 的对应关系、用 `set` 去重
7. 有序 vs 无序的完整对比与选择口诀
8. 自定义类型当 key 需要 `operator<`
9. 计数套路 + 词频统计完整例子
10. 易错点表、速查表、12 道自测
