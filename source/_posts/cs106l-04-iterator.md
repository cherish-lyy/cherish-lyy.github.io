---
title: CS106L 04 · 迭代器（Iterators）
date: 2026-11-26 13:00:00
tags: [CS106L, C++]
categories: [CS 自学, CS106L]
---

这是 CS106L 迭代器部分的完整笔记（修订版）：分类与能力、遍历写法、失效规则，以及和指针的关系。

<!-- more -->


> 修订说明：★ = 新补充的内容，⚠️ = 原笔记里的错误已改正。
> 原笔记保留，只补不删，方便对照。
> 注：按课程讲次这是 **Lecture 5**；标题沿用你笔记里的编号 04。

---


## 目录

- [1. 什么是迭代器](#s1)
  - [和下标的区别](#s2)
- [2. 四大基本操作](#s3)
  - [完整例子](#s4)
  - [★ 补充：++it 和 it++ 的区别](#s5)
- [3. 为什么迭代器都用 auto](#s6)
  - [3.1 不用 auto 的写法](#s7)
  - [3.2 用 auto](#s8)
  - [3.3 什么时候该用](#s9)
- [4. map 的迭代器：多一层 pair](#s10)
  - [4.1 为什么特殊](#s11)
  - [4.2 ⚠️ 为什么括号不能省](#s12)
  - [4.3 更常见的写法：->](#s13)
  - [4.4 遍历 map<string, vector<int>>](#s14)
  - [4.5 逐层拆开](#s15)
- [5. 用迭代器干活：交给算法](#s16)
- [6. std::sort](#s17)
- [7. std::find 找元素](#s18)
  - [7.1 为什么 find 比 count 快](#s19)
  - [7.2 ★ 补充：std::find vs 成员 .find()](#s20)
- [8. 用迭代器表示"区间"](#s21)
  - [8.1 左闭右开 [first, last)](#s22)
  - [8.2 为什么用半开区间](#s23)
  - [8.3 遍历一个子区间](#s24)
- [9. lower_bound / upper_bound](#s25)
  - [遍历一个范围](#s26)
- [10. 范围 for 的真相](#s27)
- [11. std::distance](#s28)
- [12. 五种迭代器](#s29)
  - [12.1 为什么需要分类](#s30)
  - [12.2 五种类型](#s31)
  - [12.3 大白话版](#s32)
  - [12.4 std::sort 只接受随机访问迭代器](#s33)
  - [12.5 map/set 是双向迭代器](#s34)
- [13. 指针是随机访问迭代器](#s35)
- [14. 自定义类型怎么排序](#s36)
  - [14.1 方法一：定义 operator<](#s37)
  - [14.2 方法二：传比较函数（更灵活）](#s38)
- [15. 易错点汇总](#s39)
- [16. 速查表](#s40)
- [17. 自测](#s41)
- [18. 修订记录](#s42)
  - [真错误](#s43)
  - [补充内容](#s44)

<a id="s1"></a>
## 1. 什么是迭代器

**一根"手指"，指着容器里的某个元素。**

```
容器：[10] [20] [30] [40]
                 ↑
                 it        ← 迭代器现在指着 30
```

<a id="s2"></a>
### 和下标的区别

| | 下标 `i` | 迭代器 `it` |
|---|---|---|
| 是什么 | 一个数字 | 一个位置 |
| 怎么走 | `i++` | `++it` |
| 能不能用于 `map` / `set` | ❌ 不能 | ✅ 能 |
| 怎么取值 | `v[i]` | `*it` |

**★ 补充：`end()` 在哪**

```
v = [10] [20] [30]
     ↑           ↑
  begin()      end()
 (第一个)   (最后一个元素的【后一个】)
```

**`end()` 不指向任何元素**，它只是一条"终点线"。

- 所以不能 `*v.end()`
- 循环条件写成 `it != v.end()`

---

<a id="s3"></a>
## 2. 四大基本操作

**不管底层是数组、链表还是哈希表，迭代器都保证你能做同样四件事。**

| # | 操作 | 写法 | 意思 |
|---|---|---|---|
| 1 | 创建 | `it = v.begin()` | 拿到指向第一个元素的迭代器 |
| 2 | 解引用 | `*it` | 取它指着的值（也可以改） |
| 3 | 前进 | `++it` | 往后挪一格 |
| 4 | 比较 | `it != v.end()` | 判断有没有走到终点 |

<a id="s4"></a>
### 完整例子

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};

    for (auto it = v.begin(); it != v.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << "\n";
}
```

**输出：**

```
10 20 30
```

<a id="s5"></a>
### ★ 补充：`++it` 和 `it++` 的区别

| 写法 | 含义 | 用在哪 |
|---|---|---|
| `++it` | **先加**，再返回新位置 | 循环里（推荐） |
| `it++` | 先返回旧位置，**再加** | 需要在表达式里用旧值时 |

**单独一行时两者完全一样。** 循环里习惯写 `++it`（少一次临时对象）。

---

<a id="s6"></a>
## 3. 为什么迭代器都用 `auto`

<a id="s7"></a>
### 3.1 不用 `auto` 的写法

```cpp
std::vector<int>::iterator it = v.begin();

std::map<std::string, std::set<std::string>>::iterator it2 = m.begin();
//  ↑ 类型名长得离谱
```

<a id="s8"></a>
### 3.2 用 `auto`

```cpp
auto it = v.begin();     // 编译器自己推断类型
```

**`auto` 不是新类型，是让编译器替你写类型。**

<a id="s9"></a>
### 3.3 什么时候该用

> **类型显而易见时，用 `auto`；复杂到看不懂时，写清楚反而更好。**

| 场景 | 建议 |
|---|---|
| `auto it = v.begin();` | ✅ 一眼看出是迭代器 |
| 106B 作业 | ⚠️ 老师建议少用（助教要看懂类型） |
| 106L / 实际项目 | ✅ 迭代器几乎都用 `auto` |

**`auto` 唯一"必须用"的场景是 lambda / functor，后面会讲。**

---

<a id="s10"></a>
## 4. `map` 的迭代器：多一层 `pair`

<a id="s11"></a>
### 4.1 为什么特殊

`map` 里存的不是单个值，而是 key → value 对。

所以 `*it` 得到的是一个 `pair`：

```cpp
std::map<std::string, int> m{{"Alice", 20}, {"Bob", 22}};

auto it = m.begin();

(*it).first     // "Alice"（key）
(*it).second    // 20     （value）
```

**括号不能省：先解引用，再取 `first` / `second`。**

<a id="s12"></a>
### 4.2 ⚠️ 为什么括号不能省

```cpp
*it.first      // ❌ 会被理解成 *(it.first)
```

因为 `.` 的优先级比 `*` 高。

<a id="s13"></a>
### 4.3 更常见的写法：`->`

```cpp
it->first      // ✅ 等价于 (*it).first
it->second     // ✅ 等价于 (*it).second
```

<a id="s14"></a>
### 4.4 遍历 `map<string, vector<int>>`

⚠️ **原笔记这里有 4 处错误：**

```cpp
std::map<std::string, std:vector<int>> m {    // ❌ 1. std: 少了冒号
    {"Alice", { 20, 30,40}}.                  // ❌ 2. 结尾用了点号，应该是逗号
    {"Bob",{22,12,32}}                        // ❌ 3. 上一行没逗号，这行就接不上
};
```

✅ 正确写法：

```cpp
std::map<std::string, std::vector<int>> m{
    {"Alice", {20, 30, 40}},
    {"Bob",   {22, 12, 32}}
};
```

✅ 遍历：

```cpp
for (auto it = m.begin(); it != m.end(); ++it) {
    std::cout << it->first << ": ";          // ⚠️ 原笔记写成了 it - > first

    for (auto vit = it->second.begin();
         vit != it->second.end(); ++vit) {
        std::cout << *vit << " ";             // ⚠️ 原笔记写成了 * vit
    }
    std::cout << "\n";                        // ★ 补上换行
}
```

**输出：**

```
Alice: 20 30 40
Bob: 22 12 32
```

<a id="s15"></a>
### 4.5 逐层拆开

| 代码 | 类型 | 意思 |
|---|---|---|
| `it` | map 迭代器 | 指向一组 key-value |
| `it->first` | `std::string` | 键 |
| `it->second` | `std::vector<int>` | 整个 vector |
| `it->second.begin()` | vector 迭代器 | vector 的第一个元素 |
| `*vit` | `int` | 具体分数 |

---

<a id="s16"></a>
## 5. 用迭代器干活：交给算法

**迭代器真正的用途：把整个容器交给算法处理。**

```cpp
std::sort(v.begin(), v.end());
//         ↑          ↑
//       从哪开始    到哪结束
```

---

<a id="s17"></a>
## 6. `std::sort`

```cpp
#include <algorithm>

std::vector<int> v{5, 2, 8, 1, 9};
std::sort(v.begin(), v.end());

for (int x : v) std::cout << x << " ";   // 1 2 5 8 9
```

**三个要点：**

| 点 | 说明 |
|---|---|
| 头文件 | `<algorithm>` |
| 参数 | 区间的**起点和终点**（不是元素本身） |
| 返回值 | **没有返回值**（`void`），它直接改原容器 |

**为什么 sort 不接受返回值？**

> 因为 sort 的工作是"**就地排序**"，不需要返回一个指针给我们。

**★ 补充：sort 只接受随机访问迭代器**（详见第 12 节）。

```cpp
std::list<int> l{3, 1, 2};
std::sort(l.begin(), l.end());   // ❌ 编译错误
l.sort();                        // ✅ 用 list 自己的
```

---

<a id="s18"></a>
## 7. `std::find` 找元素

```cpp
#include <algorithm>

std::vector<int> v{10, 20, 30, 40};

auto it = std::find(v.begin(), v.end(), 30);

if (it != v.end()) {
    std::cout << "找到了：" << *it << "\n";    // 找到了：30
} else {
    std::cout << "没找到\n";
}
```

**⭐ 核心：找不到时返回 `end()`。**

```
找 30 → 返回指向 30 的迭代器
找 99 → 返回 v.end()
```

**所以判断"找到没"只有一种写法：**

```cpp
if (it != v.end()) { /* 找到 */ }
```

> 不能写 `if (it)`，也不能 `if (*it)`——迭代器不是布尔值。

<a id="s19"></a>
### 7.1 为什么 `find` 比 `count` 快

> `count` 的内部实现**是用 `find` 写的**，所以 `find` 少一层函数调用，稍微快一点。

```cpp
// 只想知道"在不在" → 用 find
if (std::find(v.begin(), v.end(), 30) != v.end()) { }

// 想知道"出现了几次" → 用 count
int n = std::count(v.begin(), v.end(), 30);
```

**C++ 20 之后，`map`/`set` 可以直接用 `.contains()`。**

<a id="s20"></a>
### 7.2 ★ 补充：`std::find` vs 成员 `.find()`

**重要区别：**

| 容器 | 用哪个 | 复杂度 |
|---|---|---|
| `vector` / `list` | `std::find(...)` | O(n) |
| `set` / `map` | **成员 `s.find(x)`** | **O(log n)** |

```cpp
std::set<int> s{1, 2, 3};

std::find(s.begin(), s.end(), 2);   // O(n)：一个一个走
s.find(2);                           // O(log n)：树查找，快得多
```

> **`set` / `map` 永远优先用成员函数 `.find()`。**

---

<a id="s21"></a>
## 8. 用迭代器表示"区间"

<a id="s22"></a>
### 8.1 左闭右开 `[first, last)`

```
[10][20][30][40]
 ↑              ↑
first          last

包含 first 指的元素
不包含 last 指的元素
```

<a id="s23"></a>
### 8.2 为什么用半开区间

```
[begin, end) 的长度 = end - begin
```

**统一、不用 ±1，空区间就是 `begin == end`。**

| 写法 | 含义 |
|---|---|
| `[a, b]` | 闭区间：包含两端 |
| `(a, b)` | 开区间：都不包含 |
| **`[a, b)`** | **半开：包含 a，不包含 b** ← STL 用这个 |

<a id="s24"></a>
### 8.3 遍历一个子区间

```cpp
std::vector<int> v{1, 2, 3, 4, 5};

auto first = v.begin() + 1;    // 指向 2
auto last  = v.begin() + 3;    // 指向 4（不包含）

for (auto it = first; it != last; ++it) {
    std::cout << *it << " ";   // 2 3
}
```

---

<a id="s25"></a>
## 9. `lower_bound` / `upper_bound`

**只能用于"有序"的容器**（`map`、`set`、排好序的 `vector`）。

```cpp
std::set<int> s{1, 3, 5, 7, 9};

auto lo = s.lower_bound(3);    // 第一个 >= 3 → 3
auto hi = s.upper_bound(3);    // 第一个 >  3 → 5

std::cout << *lo;    // 3
std::cout << *hi;    // 5
```

| 函数 | 返回 | 记忆 |
|---|---|---|
| `lower_bound(x)` | 第一个 **≥ x** 的元素 | 包含等于 |
| `upper_bound(x)` | 第一个 **> x** 的元素 | 严格大于 |

```
集合：1  3  5  7  9
      lower_bound(3) → 3
      upper_bound(3) → 5
      lower_bound(4) → 5
      upper_bound(4) → 5
```

<a id="s26"></a>
### 遍历一个范围

⚠️ **原笔记这里漏了变量名 `s`：**

```cpp
std::set<int> { 1, 3, 5, 7, 9};   // ❌ 没有变量名
```

✅ 正确：

```cpp
std::set<int> s{1, 3, 5, 7, 9};

auto it   = s.lower_bound(3);
auto stop = s.upper_bound(7);

while (it != stop) {
    std::cout << *it << " ";   // 3 5 7
    ++it;
}
```

> `upper_bound(7)` 返回的是 **9 的位置**，所以 7 会被包含，9 不会。

---

<a id="s27"></a>
## 10. 范围 for 的真相

```cpp
for (int x : v) {
    std::cout << x;
}
```

**编译器把它变成：**

```cpp
for (auto it = v.begin(); it != v.end(); ++it) {
    int x = *it;
    std::cout << x;
}
```

**"范围 for" = 迭代器循环的语法糖。**

| 写法 | 等价于 |
|---|---|
| `for (int x : v)` | 拷贝每一个元素 |
| `for (int& x : v)` | 引用，能修改原元素 |
| `for (const int& x : v)` | 引用，不能修改（推荐） |

```cpp
for (int& x : v) x *= 2;     // ✅ 真的改了容器里的值
for (int x : v)  x *= 2;     // ❌ 只改了副本
```

---

<a id="s28"></a>
## 11. `std::distance`

```cpp
auto it = std::find(v.begin(), v.end(), 30);
int index = std::distance(v.begin(), it);
```

⚠️ **原笔记写 `// 3（如果 30 在索引 3）` 有误。**
`v{10, 20, 30, 40}` 里 30 的下标是 **2**（从 0 开始数）。

| 容器 | `distance` 的含义 |
|---|---|
| `vector` / `deque` | 就是**下标** |
| `set` / `map` / `list` | 只表示"走了几步"，**没有下标概念** |

**复杂度：**

- `vector` / `deque`：**O(1)**（直接相减）
- `list` / `set` / `map`：**O(n)**（一个一个数）

---

<a id="s29"></a>
## 12. 五种迭代器

<a id="s30"></a>
### 12.1 为什么需要分类

```cpp
auto it = v.begin();
it + 3;        // ✅ vector 可以
```

```cpp
auto it = l.begin();   // list
it + 3;                // ❌ 编译错误
```

**因为 `list` 内存不连续，不知道第 3 个在哪，只能一步一步走。**

<a id="s31"></a>
### 12.2 五种类型

| 类型 | 能读 | 能写 | 多趟 | `--` | `+n` / 比较大小 | 典型容器 |
|---|---|---|---|---|---|---|
| **input**（输入） | ✅ | ❌ | ❌ 单趟 | ❌ | ❌ | `istream` |
| **output**（输出） | ❌ | ✅ | ❌ 单趟 | ❌ | ❌ | `ostream` |
| **forward**（前向） | ✅ | ✅ | ✅ | ❌ | ❌ | `forward_list` |
| **bidirectional**（双向） | ✅ | ✅ | ✅ | ✅ | ❌ | `list`、`map`、`set` |
| **random access**（随机访问） | ✅ | ✅ | ✅ | ✅ | ✅ | `vector`、`deque`、`string` |

⚠️ 原表格 input 行"典型容器"里多打了一个 `i`（写成了 `i stream`），已改正为 `istream`。

**能力是包含关系：**

```
input ─┐
       ├─→ forward ─→ bidirectional ─→ random access
output ─┘
```

**随机访问迭代器也是双向的，只是更强。**

<a id="s32"></a>
### 12.3 大白话版

| 类型 | 类比 | 限制 |
|---|---|---|
| input | 看报纸 | 只能看，只能从头读到尾一次 |
| output | 写便签 | 只能写，写完就走 |
| forward | 单行道 | 能读能写，只能往前，可以走很多遍 |
| bidirectional | 双向街 | 能前进也能后退 |
| random access | 电梯 | 想跳几层跳几层（`+3`、`-2`） |

<a id="s33"></a>
### 12.4 `std::sort` 只接受随机访问迭代器

```cpp
std::list<int> l{3, 1, 2};
std::sort(l.begin(), l.end());   // ❌
l.sort();                        // ✅
```

**原因：`sort` 需要"跳到中间"（快排/归并），链表做不到。**

**同理：`std::sort` 不能用于 `map` / `set`**——它们本身就是有序的。

<a id="s34"></a>
### 12.5 `map`/`set` 是双向迭代器

```cpp
std::set<int> s{1, 2, 3};
auto it = s.begin();
++it;      // ✅
--it;      // ✅ 双向可以后退
it + 2;    // ❌ 不能跳
```

---

<a id="s35"></a>
## 13. 指针是随机访问迭代器

⚠️ **不是"迭代器是指针"，而是「指针是一种迭代器」。**

```cpp
int a[5] = {1, 2, 3, 4, 5};
int* p = a;              // p 就是随机访问迭代器

std::sort(a, a + 5);     // ✅ 普通数组也能被 STL 算法处理
```

| | 指针 | 迭代器 |
|---|---|---|
| 是什么 | 一个内存地址 | 一个"位置"，内部可能就是地址 |
| 安全性 | **可以随便指**（危险） | 只能从容器拿，不能乱指 |
| 能力 | 随机访问 | 视容器而定 |

---

<a id="s36"></a>
## 14. 自定义类型怎么排序

<a id="s37"></a>
### 14.1 方法一：定义 `operator<`

```cpp
struct Student {
    std::string name;
    int score;
};

bool operator<(const Student& a, const Student& b) {
    return a.score < b.score;      // 按分数排
}

std::vector<Student> v{{"A", 90}, {"B", 75}};
std::sort(v.begin(), v.end());     // 用 operator<
```

<a id="s38"></a>
### 14.2 方法二：传比较函数（更灵活）

```cpp
std::sort(v.begin(), v.end(),
          [](const Student& a, const Student& b) {
              return a.name < b.name;   // 按名字排
          });
```

`[](...) { ... }` 是 **lambda（匿名函数）**，后面专门讲。

**好处：同一个类型，可以按不同规则排序。**

**★ 补充：比较函数必须满足"严格弱序"**

- 不能写 `<=`（相等时返回 true 会出问题）
- 只能写 `<`

---

<a id="s39"></a>
## 15. 易错点汇总

| ❌ 错误 | ✅ 正确 | 原因 |
|---|---|---|
| `it < v.end()` 用于 `list` | `it != v.end()` | `list` 迭代器不能比较大小 |
| `*it.first` | `it->first` 或 `(*it).first` | 优先级 |
| `std::find` 找不到返回 `NULL` | 返回 `end()` | 迭代器不是指针 |
| `std::sort(list.begin(), list.end())` | `list.sort()` | sort 需要随机访问迭代器 |
| `it + 3` 用于 `set` | `++it` 三次 | set 是双向迭代器 |
| 边遍历边 `erase` | `it = v.erase(it)` | erase 让原迭代器失效 |
| `for (int x : v) x *= 2` | `for (int& x : v) x *= 2` | 不加 `&` 改的是副本 |
| `*v.end()` | 不能解引用 | end 不指向元素 |
| 对 `set` 用 `std::find` | `s.find(x)` | 前者 O(n)，后者 O(log n) |
| `it - > first` | `it->first` | `->` 是一个整体符号 |
| `std::set<int> {1,2,3};` | `std::set<int> s{1,2,3};` | 少了变量名 |

---

<a id="s40"></a>
## 16. 速查表

| 我想干的事 | 写法 |
|---|---|
| 拿到开头 | `auto it = v.begin();` |
| 拿到结尾 | `v.end()` |
| 取值 | `*it` |
| 前进 | `++it` |
| 判断到头 | `it != v.end()` |
| 遍历 | `for (auto it = v.begin(); it != v.end(); ++it)` |
| map 的 key | `it->first` |
| map 的 value | `it->second` |
| 排序 | `std::sort(v.begin(), v.end());` |
| 查找 | `std::find(v.begin(), v.end(), x);` |
| 没找到 | 返回 `v.end()` |
| 计数 | `std::count(v.begin(), v.end(), x);` |
| 第一个 ≥ x | `std::lower_bound(...)` |
| 第一个 > x | `std::upper_bound(...)` |
| 距离 / 下标 | `std::distance(v.begin(), it);` |
| set/map 查找 | `s.find(x)` |
| 范围 for 改元素 | `for (auto& x : v)` |

---

<a id="s41"></a>
## 17. 自测

1. 迭代器的四大基本操作是什么？
2. `end()` 指向哪里？为什么不能 `*end()`？
3. `std::find` 找不到时返回什么？怎么判断？
4. 为什么 `find` 比 `count` 略快？
5. 对 `set` 应该用 `std::find` 还是 `s.find()`？为什么？
6. `[begin, end)` 为什么是左闭右开？
7. `lower_bound(3)` 和 `upper_bound(3)` 在 `{1,3,5}` 上分别返回什么？
8. 范围 for 底层是什么？`for (int& x : v)` 和 `for (int x : v)` 差在哪？
9. 五种迭代器分别是什么？`vector` / `list` / `set` / `unordered_map` 各属于哪种？
10. 为什么 `std::sort` 不能排序 `list`？
11. 为什么说"指针是一种迭代器"，而不是反过来？
12. `std::distance` 对 `vector` 和 `list` 的复杂度分别是多少？

---

<a id="s42"></a>
## 18. 修订记录

<a id="s43"></a>
### 真错误

| 位置 | 原文 | 改为 |
|---|---|---|
| map 示例 | `std:vector<int>` | `std::vector<int>` |
| map 示例 | `}}` 后面用了 `.` | `}},`（逗号） |
| 遍历 | `it - > first` | `it->first` |
| 遍历 | `* vit` | `*vit` |
| 遍历 | 没有换行输出 | 补 `std::cout << "\n";` |
| lower_bound | `std::set<int> {1,3,5,7,9};` 没有变量名 | `std::set<int> s{...};` |
| distance | 注释写"30 在索引 3" | **索引 2**（从 0 开始） |
| 类型表 | input 行容器写成 `i stream` | `istream` |
| 标题 | `CS106L 04 · iterator` | **迭代器（Iterators）**，并注明是课程第 5 讲 |

<a id="s44"></a>
### 补充内容

1. `end()` 是"最后一个元素之后"，不能解引用
2. `++it` 与 `it++` 的区别
3. `map<string, vector<int>>` 的正确初始化和两层遍历
4. `std::find` 与成员 `.find()` 的复杂度差别（set/map 必须用成员版）
5. `sort` 只接受随机访问迭代器；`list` 用 `l.sort()`
6. `map`/`set` 是双向迭代器（能 `--`，不能 `+n`）
7. 比较函数必须满足"严格弱序"（只能写 `<`）
8. 迭代器失效（边遍历边 erase）
9. 12 道自测题
