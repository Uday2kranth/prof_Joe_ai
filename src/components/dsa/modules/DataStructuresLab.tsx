import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DataStructuresLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm: (id: string) => void;
}

interface BSTNode {
  id: string;
  val: number;
  height: number;
  color?: 'red' | 'black';
  left?: BSTNode;
  right?: BSTNode;
  x?: number;
  y?: number;
}

interface TrieVisualNode {
  id: string;
  char: string;
  isEnd: boolean;
  fullWord?: string;
  children: { [char: string]: TrieVisualNode };
  x?: number;
  y?: number;
}

interface BTree234Node {
  id: string;
  keys: number[];
  children: BTree234Node[];
  isLeaf: boolean;
  x?: number;
  y?: number;
}

export const DataStructuresLab: React.FC<DataStructuresLabProps> = ({
  activeAlgorithm,
  onSelectAlgorithm
}) => {
  const [activeDs, setActiveDs] = useState<
    | 'array_ds'
    | 'string_ds'
    | 'singly_linked_list'
    | 'doubly_linked_list'
    | 'circular_linked_list'
    | 'stack_ds'
    | 'queue_ds'
    | 'hash_table'
    | 'binary_tree_ds'
    | 'bst_ds'
    | 'avl_ds'
    | 'rbtree_ds'
    | 'segment_tree_ds'
    | 'trie_ds'
    | 'heap_ds'
    | 'b_tree_ds'
    | 'disjoint_set_ds'
  >('array_ds');

  // Input states
  const [inputValue, setInputValue] = useState<string>('42');
  const [indexInput, setIndexInput] = useState<string>('2');
  const [strValue, setStrValue] = useState<string>('kranth');
  const [keyInput, setKeyInput] = useState<string>('user_id');
  const [valueInput, setValueInput] = useState<string>('1042');
  const [secondaryInput, setSecondaryInput] = useState<string>('5');
  const [rangeLeft, setRangeLeft] = useState<string>('1');
  const [rangeRight, setRangeRight] = useState<string>('3');
  const [statusMessage, setStatusMessage] = useState<string>('Ready. Choose an operation below.');
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [pointerLabels, setPointerLabels] = useState<{ [index: number]: string }>({});
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  const DS_TABS_MAP: Record<string, string> = {
    array_ds: '📊 Array (Contiguous)',
    string_ds: '🔤 String & Palindrome',
    singly_linked_list: '➡️ Singly Linked List',
    doubly_linked_list: '↔️ Doubly Linked List',
    circular_linked_list: '🔄 Circular Linked List',
    stack_ds: '🥞 Stack (LIFO Reactor)',
    queue_ds: '🚶 Queue (FIFO & Ring)',
    hash_table: '#️⃣ Hash Table (Chaining/Probing)',
    binary_tree_ds: '🌲 Binary Tree (Hierarchy)',
    bst_ds: '🔍 Binary Search Tree (BST)',
    avl_ds: '⚖️ AVL Tree (Self-Balancing)',
    rbtree_ds: '🔴⚫ Red-Black Tree',
    segment_tree_ds: '📊 Segment Tree (Range Queries)',
    trie_ds: '🔠 Trie (Prefix Tree)',
    heap_ds: '🔺 Heap (Priority Queue)',
    b_tree_ds: '📚 B-Tree (2-3-4)',
    disjoint_set_ds: '🔗 Disjoint Sets (Union-Find)'
  };

  useEffect(() => {
    if (activeAlgorithm) {
      if (activeAlgorithm === 'bst_avl') {
        setActiveDs('avl_ds');
      } else if (activeAlgorithm === 'red_black') {
        setActiveDs('rbtree_ds');
      } else if (activeAlgorithm in DS_TABS_MAP) {
        setActiveDs(activeAlgorithm as any);
      }
    }
  }, [activeAlgorithm]);

  const handleSelectDs = (tabId: string) => {
    setActiveDs(tabId as any);
    onSelectAlgorithm(tabId);
    setHighlightedIndices([]);
    setPointerLabels({});
    setStatusMessage(`Switched to ${DS_TABS_MAP[tabId] || tabId}. Select an operation.`);
  };

  // -------------------------------------------------------------
  // 1. ARRAY VISUALIZER (CONTIGUOUS MEMORY, RESIZING, ROTATION, PREFIX SUM)
  // -------------------------------------------------------------
  const [arrayData, setArrayData] = useState<number[]>([14, 28, 35, 42, 56, 63, 70, 84]);
  const [arrayCapacity, setArrayCapacity] = useState<number>(10);
  const [showPrefixSum, setShowPrefixSum] = useState<boolean>(false);
  const baseAddress = 0x100;

  const handleArrayInsert = () => {
    const val = parseInt(inputValue, 10);
    const idx = parseInt(indexInput, 10);
    if (isNaN(val) || isNaN(idx) || idx < 0 || idx > arrayData.length) {
      setStatusMessage('Invalid index or value for Array insertion.');
      return;
    }
    if (arrayData.length >= arrayCapacity) {
      // Dynamic array capacity doubling simulation
      const newCap = arrayCapacity * 2;
      setArrayCapacity(newCap);
      const nextArr = [...arrayData];
      nextArr.splice(idx, 0, val);
      setArrayData(nextArr);
      setHighlightedIndices([idx]);
      setStatusMessage(`⚡ Capacity Doubled (${arrayCapacity} → ${newCap})! Reallocated new continuous memory buffer and inserted ${val} at [${idx}].`);
      return;
    }
    const nextArr = [...arrayData];
    nextArr.splice(idx, 0, val);
    setArrayData(nextArr);
    setHighlightedIndices([idx]);
    setStatusMessage(`Inserted ${val} at index [${idx}]. Shifted subsequent elements right by 1 slot (O(n) time). Address: 0x${(baseAddress + idx * 4).toString(16).toUpperCase()}`);
  };

  const handleArrayUpdate = () => {
    const val = parseInt(inputValue, 10);
    const idx = parseInt(indexInput, 10);
    if (isNaN(val) || isNaN(idx) || idx < 0 || idx >= arrayData.length) {
      setStatusMessage('Index out of bounds for array update.');
      return;
    }
    const nextArr = [...arrayData];
    nextArr[idx] = val;
    setArrayData(nextArr);
    setHighlightedIndices([idx]);
    setStatusMessage(`O(1) Random Access: Updated arr[${idx}] = ${val}. Memory Address: 0x${(baseAddress + idx * 4).toString(16).toUpperCase()}`);
  };

  const handleArrayDelete = () => {
    const idx = parseInt(indexInput, 10);
    if (isNaN(idx) || idx < 0 || idx >= arrayData.length) {
      setStatusMessage('Invalid index to delete.');
      return;
    }
    const val = arrayData[idx];
    const nextArr = [...arrayData];
    nextArr.splice(idx, 1);
    setArrayData(nextArr);
    setHighlightedIndices([]);
    setStatusMessage(`Deleted element ${val} at index [${idx}]. Shifted subsequent elements left by 1 (O(n) time).`);
  };

  const handleArrayRotate = (direction: 'left' | 'right') => {
    if (arrayData.length <= 1) return;
    const nextArr = [...arrayData];
    if (direction === 'left') {
      const first = nextArr.shift()!;
      nextArr.push(first);
      setStatusMessage(`Left Shifted Array: First element (${first}) wrapped around to tail in O(n) time.`);
    } else {
      const last = nextArr.pop()!;
      nextArr.unshift(last);
      setStatusMessage(`Right Shifted Array: Last element (${last}) wrapped around to head in O(n) time.`);
    }
    setArrayData(nextArr);
  };

  const handleArrayLinearSearch = async () => {
    const target = parseInt(inputValue, 10);
    if (isNaN(target)) return;
    setStatusMessage(`Starting Linear Search for ${target} from index 0 to ${arrayData.length - 1}...`);
    for (let i = 0; i < arrayData.length; i++) {
      setHighlightedIndices([i]);
      setPointerLabels({ [i]: 'i' });
      await new Promise(r => setTimeout(r, 450));
      if (arrayData[i] === target) {
        setStatusMessage(`🎯 FOUND target ${target} at index [${i}]! Comparisons: ${i + 1}. Time: O(n).`);
        return;
      }
    }
    setPointerLabels({});
    setStatusMessage(`Target ${target} not found in array after ${arrayData.length} comparisons.`);
  };

  const handleArrayBinarySearch = async () => {
    const target = parseInt(inputValue, 10);
    if (isNaN(target)) return;
    const sorted = [...arrayData].sort((a, b) => a - b);
    setArrayData(sorted);
    setStatusMessage(`Sorted array for Binary Search. Target: ${target}`);
    await new Promise(r => setTimeout(r, 600));

    let l = 0;
    let r = sorted.length - 1;
    let step = 0;
    while (l <= r) {
      step++;
      const mid = Math.floor((l + r) / 2);
      setHighlightedIndices([mid]);
      setPointerLabels({ [l]: 'L', [mid]: 'MID', [r]: 'R' });
      setStatusMessage(`Step ${step}: L=${l}, R=${r}, MID=${mid} (arr[mid]=${sorted[mid]})`);
      await new Promise(res => setTimeout(res, 800));

      if (sorted[mid] === target) {
        setStatusMessage(`🎯 FOUND target ${target} at sorted index [${mid}] in ${step} steps! Time: O(log n).`);
        return;
      }
      if (sorted[mid] < target) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
    setPointerLabels({});
    setStatusMessage(`Target ${target} not found in array (L > R).`);
  };

  // -------------------------------------------------------------
  // 2. STRING (PALINDROME, KMP SUBSTRING SEARCH, ANAGRAM, RUN-LENGTH)
  // -------------------------------------------------------------
  const [stringBuffer, setStringBuffer] = useState<string>('racecar');
  const [patternInput, setPatternInput] = useState<string>('car');
  const [stringPointers, setStringPointers] = useState<{ left?: number; right?: number }>({});

  const handleStringReverse = async () => {
    let s = stringBuffer.split('');
    let l = 0;
    let r = s.length - 1;
    setStatusMessage('Two-Pointer String Reversal (In-Place Swap O(n/2))...');
    while (l < r) {
      setStringPointers({ left: l, right: r });
      setStatusMessage(`Swapping s[${l}] ('${s[l]}') with s[${r}] ('${s[r]}')`);
      await new Promise(res => setTimeout(res, 500));
      const tmp = s[l];
      s[l] = s[r];
      s[r] = tmp;
      setStringBuffer(s.join(''));
      l++;
      r--;
    }
    setStringPointers({});
    setStatusMessage(`String reversed successfully: "${s.join('')}"`);
  };

  const handleStringPalindrome = async () => {
    const s = stringBuffer;
    let l = 0;
    let r = s.length - 1;
    let isPal = true;
    setStatusMessage('Checking Palindrome using Two Pointers (Left → ← Right)...');
    while (l < r) {
      setStringPointers({ left: l, right: r });
      if (s[l] !== s[r]) {
        setStatusMessage(`❌ Mismatch: s[${l}] ('${s[l]}') !== s[${r}] ('${s[r]}'). Not a palindrome!`);
        isPal = false;
        break;
      }
      setStatusMessage(`✓ Match: s[${l}] ('${s[l]}') === s[${r}] ('${s[r]}')`);
      await new Promise(res => setTimeout(res, 600));
      l++;
      r--;
    }
    setStringPointers({});
    if (isPal) {
      setStatusMessage(`🎉 YES! "${s}" is a Valid Palindrome! Symmetry verified.`);
    }
  };

  const handleStringKmpSearch = async () => {
    const text = stringBuffer;
    const pat = patternInput.trim();
    if (!pat) return;
    setStatusMessage(`KMP / Substring Search for pattern "${pat}" in text "${text}"...`);
    let found = false;
    for (let i = 0; i <= text.length - pat.length; i++) {
      setStringPointers({ left: i, right: i + pat.length - 1 });
      await new Promise(r => setTimeout(r, 450));
      if (text.substring(i, i + pat.length) === pat) {
        setStatusMessage(`🎯 FOUND pattern "${pat}" at starting index [${i}]!`);
        found = true;
        break;
      }
    }
    if (!found) {
      setStringPointers({});
      setStatusMessage(`Pattern "${pat}" not found in text.`);
    }
  };

  const handleStringCompress = () => {
    const s = stringBuffer;
    if (!s) return;
    let res = '';
    let count = 1;
    for (let i = 0; i < s.length; i++) {
      if (i < s.length - 1 && s[i] === s[i + 1]) {
        count++;
      } else {
        res += `${s[i]}${count > 1 ? count : '1'}`;
        count = 1;
      }
    }
    setStatusMessage(`Run-Length Encoding: "${s}" → Compressed: "${res}"`);
  };

  // -------------------------------------------------------------
  // 3. SINGLY LINKED LIST (FLOYD'S CYCLE DETECTION & MIDDLE NODE)
  // -------------------------------------------------------------
  const [sllNodes, setSllNodes] = useState<{ id: string; val: number }[]>([
    { id: 'n1', val: 12 },
    { id: 'n2', val: 24 },
    { id: 'n3', val: 36 },
    { id: 'n4', val: 48 },
    { id: 'n5', val: 60 }
  ]);
  const [activeSllId, setActiveSllId] = useState<string | null>(null);
  const [sllCyclePointers, setSllCyclePointers] = useState<{ slow?: string; fast?: string }>({});

  const handleSllPrepend = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      const newNode = { id: `n-${Date.now()}`, val };
      setSllNodes(prev => [newNode, ...prev]);
      setStatusMessage(`Prepend O(1): Created newNode(${val}) → new HEAD.`);
    }
  };

  const handleSllAppend = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      const newNode = { id: `n-${Date.now()}`, val };
      setSllNodes(prev => [...prev, newNode]);
      setStatusMessage(`Append O(n): Traversed to Tail and linked tail.next = newNode(${val}).`);
    }
  };

  const handleSllInsertAt = () => {
    const val = parseInt(inputValue, 10);
    const idx = parseInt(indexInput, 10);
    if (isNaN(val) || isNaN(idx) || idx < 0 || idx > sllNodes.length) return;
    const newNode = { id: `n-${Date.now()}`, val };
    const next = [...sllNodes];
    next.splice(idx, 0, newNode);
    setSllNodes(next);
    setStatusMessage(`InsertAt [${idx}]: Traversed ${idx} hops and spliced newNode(${val}) in O(k) time.`);
  };

  const handleSllDeleteVal = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    setSllNodes(prev => prev.filter(n => n.val !== val));
    setStatusMessage(`Deleted node with value ${val} by updating prev.next = curr.next.`);
  };

  const handleSllFindMiddle = async () => {
    if (sllNodes.length === 0) return;
    setStatusMessage('Finding Middle Node in single pass using Slow & Fast Pointers (Tortoise & Hare)...');
    let slow = 0;
    let fast = 0;
    while (fast < sllNodes.length && fast + 1 < sllNodes.length) {
      setSllCyclePointers({ slow: sllNodes[slow].id, fast: sllNodes[fast].id });
      setStatusMessage(`Slow at [${slow}] (val: ${sllNodes[slow].val}), Fast at [${fast}] (val: ${sllNodes[fast].val})`);
      await new Promise(r => setTimeout(r, 700));
      slow += 1;
      fast += 2;
    }
    setSllCyclePointers({ slow: sllNodes[slow]?.id });
    setActiveSllId(sllNodes[slow]?.id || null);
    setStatusMessage(`🎯 FOUND Middle Node: Node [${slow}] with Value [${sllNodes[slow]?.val}]! Time: O(n/2) single-pass.`);
  };

  const handleSllReverse = async () => {
    setStatusMessage('Inverting pointer directions: next = curr.next; curr.next = prev; prev = curr...');
    const reversed = [...sllNodes].reverse();
    setSllNodes(reversed);
    setStatusMessage(`List reversed in O(n) time. New HEAD = ${reversed[0]?.val}`);
  };

  // -------------------------------------------------------------
  // 4. DOUBLY LINKED LIST
  // -------------------------------------------------------------
  const [dllNodes, setDllNodes] = useState<{ id: string; val: number }[]>([
    { id: 'd1', val: 10 },
    { id: 'd2', val: 20 },
    { id: 'd3', val: 30 },
    { id: 'd4', val: 40 }
  ]);

  const handleDllPrepend = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      const newNode = { id: `dll-${Date.now()}`, val };
      setDllNodes(prev => [newNode, ...prev]);
      setStatusMessage(`DLL Prepend O(1): Linked newNode.next = HEAD, HEAD.prev = newNode.`);
    }
  };

  const handleDllAppend = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      const newNode = { id: `dll-${Date.now()}`, val };
      setDllNodes(prev => [...prev, newNode]);
      setStatusMessage(`DLL Append O(1) with Tail: Linked TAIL.next = newNode, newNode.prev = TAIL.`);
    }
  };

  const handleDllReverse = () => {
    setDllNodes(prev => [...prev].reverse());
    setStatusMessage('Reversed Doubly Linked List by swapping prev & next pointers for each node.');
  };

  // -------------------------------------------------------------
  // 5. CIRCULAR LINKED LIST & JOSEPHUS PROBLEM
  // -------------------------------------------------------------
  const [cllNodes, setCllNodes] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [activeCllIdx, setActiveCllIdx] = useState<number | null>(null);

  const handleCllInsertTail = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      setCllNodes(prev => [...prev, val]);
      setStatusMessage(`Inserted ${val}. Updated tail.next = HEAD maintaining continuous ring.`);
    }
  };

  const handleCllJosephus = async () => {
    let circle = [...cllNodes];
    const k = 3;
    setStatusMessage(`Running Josephus Problem Elimination (Step K = ${k})...`);
    let curr = 0;
    while (circle.length > 1) {
      curr = (curr + k - 1) % circle.length;
      const eliminated = circle[curr];
      setActiveCllIdx(curr);
      setStatusMessage(`Counted ${k} steps → Eliminating Node [${eliminated}]! Remaining: ${circle.length - 1}`);
      await new Promise(r => setTimeout(r, 700));
      circle.splice(curr, 1);
      setCllNodes([...circle]);
    }
    setActiveCllIdx(0);
    setStatusMessage(`👑 SURVIVOR! Josephus Safe Position is Node [${circle[0]}]!`);
  };

  // -------------------------------------------------------------
  // 6. STACK REACTOR CORE (LIFO & BALANCED PARENTHESES / INFIX)
  // -------------------------------------------------------------
  const [stackCapsules, setStackCapsules] = useState<number[]>([10, 20, 30, 40]);
  const stackCapacity = 8;

  const handleStackPush = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    if (stackCapsules.length >= stackCapacity) {
      setStatusMessage('🚨 STACK OVERFLOW! Reactor chamber full (Max 8 elements).');
      return;
    }
    setStackCapsules(prev => [...prev, val]);
    setStatusMessage(`PUSH O(1): Loaded Capsule [${val}] onto TOP hatch (Index ${stackCapsules.length}).`);
  };

  const handleStackPop = () => {
    if (stackCapsules.length === 0) {
      setStatusMessage('🚨 STACK UNDERFLOW! Reactor empty.');
      return;
    }
    const popped = stackCapsules[stackCapsules.length - 1];
    setStackCapsules(prev => prev.slice(0, -1));
    setStatusMessage(`POP O(1): Ejected Capsule [${popped}] from TOP hatch.`);
  };

  const handleStackPeek = () => {
    if (stackCapsules.length === 0) return;
    const topVal = stackCapsules[stackCapsules.length - 1];
    setStatusMessage(`PEEK O(1): Current TOP element is [${topVal}] at index ${stackCapsules.length - 1}.`);
  };

  const handleStackParenCheck = async () => {
    const expr = '{[()]}';
    setStatusMessage(`Validating Parentheses Expression "${expr}" using LIFO Stack...`);
    const stk: string[] = [];
    const map: Record<string, string> = { '}': '{', ']': '[', ')': '(' };
    let valid = true;
    for (const ch of expr) {
      if (['{', '[', '('].includes(ch)) {
        stk.push(ch);
        setStatusMessage(`Open bracket '${ch}' → PUSHED to stack: [ ${stk.join(', ')} ]`);
      } else if (['}', ']', ')'].includes(ch)) {
        const top = stk.pop();
        if (top !== map[ch]) {
          valid = false;
          break;
        }
        setStatusMessage(`Closed bracket '${ch}' matched with '${top}' → POPPED.`);
      }
      await new Promise(r => setTimeout(r, 600));
    }
    if (valid && stk.length === 0) {
      setStatusMessage(`🎉 YES! "${expr}" has Perfectly Balanced Parentheses!`);
    } else {
      setStatusMessage(`❌ Unbalanced Parentheses in "${expr}".`);
    }
  };

  // -------------------------------------------------------------
  const [queueItems, setQueueItems] = useState<number[]>([11, 22, 33, 44]);

  const handleQueueEnqueueRear = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    setQueueItems(prev => [...prev, val]);
    setStatusMessage(`ENQUEUE REAR O(1): Appended [${val}] to REAR of queue.`);
  };

  const handleQueueDequeueFront = () => {
    if (queueItems.length === 0) {
      setStatusMessage('🚨 QUEUE UNDERFLOW! Queue is empty.');
      return;
    }
    const front = queueItems[0];
    setQueueItems(prev => prev.slice(1));
    setStatusMessage(`DEQUEUE FRONT O(1): Removed FRONT element [${front}].`);
  };

  const handleQueueEnqueueFront = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    setQueueItems(prev => [val, ...prev]);
    setStatusMessage(`DEQUE ENQUEUE FRONT O(1): Prepended [${val}] at FRONT.`);
  };

  const handleQueueDequeueRear = () => {
    if (queueItems.length === 0) return;
    const last = queueItems[queueItems.length - 1];
    setQueueItems(prev => prev.slice(0, -1));
    setStatusMessage(`DEQUE DEQUEUE REAR O(1): Popped [${last}] from REAR.`);
  };

  // -------------------------------------------------------------
  // 8. HASH TABLE & HASH MAP (QUADRATIC PROBING & REHASHING)
  // -------------------------------------------------------------
  const [hashMode, setHashMode] = useState<'chaining' | 'linear_probing' | 'quadratic_probing' | 'hash_map'>('chaining');
  const tableSize = 7;
  const [chainingTable, setChainingTable] = useState<number[][]>([
    [14], [22, 1], [], [10, 17], [], [26], []
  ]);
  const [probingTable, setProbingTable] = useState<(number | null)[]>([14, 22, 1, 10, 17, 26, null]);
  const [hashMapEntries, setHashMapEntries] = useState<{ key: string; value: string; hash: number }[]>([
    { key: 'user_id', value: '1042', hash: 3 },
    { key: 'username', value: 'alice_99', hash: 1 },
    { key: 'email', value: 'alice@acm.org', hash: 5 },
    { key: 'role', value: 'student', hash: 1 }
  ]);

  const handleHashInsert = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      const idx = ((val % tableSize) + tableSize) % tableSize;
      if (hashMode === 'chaining') {
        setChainingTable(prev => {
          const next = prev.map(bucket => [...bucket]);
          if (!next[idx]) next[idx] = [];
          if (!next[idx].includes(val)) next[idx].push(val);
          return next;
        });
        setStatusMessage(`Key ${val} hashed to Slot [${idx}] (${val} mod ${tableSize} = ${idx}). Appended to linked bucket chain.`);
      } else if (hashMode === 'linear_probing' || hashMode === 'quadratic_probing') {
        let placed = false;
        setProbingTable(prev => {
          const next = [...prev];
          for (let i = 0; i < tableSize; i++) {
            const probeOffset = hashMode === 'quadratic_probing' ? i * i : i;
            const probeIdx = (idx + probeOffset) % tableSize;
            if (next[probeIdx] === null || next[probeIdx] === val) {
              next[probeIdx] = val;
              placed = true;
              setStatusMessage(`${hashMode === 'quadratic_probing' ? 'Quadratic' : 'Linear'} Probe: Inserted key ${val} at Slot [${probeIdx}] after probe step i=${i}.`);
              break;
            }
          }
          if (!placed) setStatusMessage(`Hash Table is full! Trigger Rehashing (Table Doubling).`);
          return next;
        });
      }
    }
  };

  const handleHashMapPut = () => {
    if (keyInput.trim() && valueInput.trim()) {
      let hash = 0;
      for (let i = 0; i < keyInput.length; i++) hash = (hash * 31 + keyInput.charCodeAt(i)) % tableSize;
      setHashMapEntries(prev => [...prev.filter(e => e.key !== keyInput), { key: keyInput, value: valueInput, hash }]);
      setStatusMessage(`Hash Map Put: "${keyInput}" hashed to Bucket [${hash}]. Stored {"${keyInput}": "${valueInput}"}.`);
    }
  };

  // -------------------------------------------------------------
  // 9. GENERAL BINARY TREE (METRICS & TRAVERSALS)
  // -------------------------------------------------------------
  const [binaryTreeNodes, setBinaryTreeNodes] = useState<number[]>([42, 21, 63, 14, 28, 56, 77]);
  const [visitedRibbon, setVisitedRibbon] = useState<number[]>([]);
  const [activeTreeNodeIndex, setActiveTreeNodeIndex] = useState<number | null>(null);

  const handleBinaryTreeInsert = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    if (binaryTreeNodes.length >= 15) {
      setStatusMessage('Binary tree display limit reached (15 nodes)!');
      return;
    }
    setBinaryTreeNodes(prev => [...prev, val]);
    setStatusMessage(`Level-order Insert: Inserted ${val} into next open slot.`);
  };

  const handleBinaryTreeInvert = () => {
    // Invert binary tree (swap left and right child pointers at all levels)
    const invertRec = (idx: number, arr: number[]): void => {
      const l = 2 * idx + 1;
      const r = 2 * idx + 2;
      if (l < arr.length && r < arr.length) {
        const tmp = arr[l];
        arr[l] = arr[r];
        arr[r] = tmp;
        invertRec(l, arr);
        invertRec(r, arr);
      }
    };
    const nextArr = [...binaryTreeNodes];
    invertRec(0, nextArr);
    setBinaryTreeNodes(nextArr);
    setStatusMessage('Inverted / Mirrored Binary Tree: Swapped left and right subtrees of every node in O(n) time.');
  };

  const handleBinaryTreeTraverse = async (mode: 'inorder' | 'preorder' | 'postorder' | 'bfs') => {
    setStatusMessage(`Running ${mode.toUpperCase()} Traversal...`);
    setVisitedRibbon([]);
    const sequence: number[] = [];

    const getInorder = (idx: number) => {
      if (idx >= binaryTreeNodes.length) return;
      getInorder(2 * idx + 1);
      sequence.push(idx);
      getInorder(2 * idx + 2);
    };
    const getPreorder = (idx: number) => {
      if (idx >= binaryTreeNodes.length) return;
      sequence.push(idx);
      getPreorder(2 * idx + 1);
      getPreorder(2 * idx + 2);
    };
    const getPostorder = (idx: number) => {
      if (idx >= binaryTreeNodes.length) return;
      getPostorder(2 * idx + 1);
      getPostorder(2 * idx + 2);
      sequence.push(idx);
    };

    if (mode === 'inorder') getInorder(0);
    else if (mode === 'preorder') getPreorder(0);
    else if (mode === 'postorder') getPostorder(0);
    else if (mode === 'bfs') {
      for (let i = 0; i < binaryTreeNodes.length; i++) sequence.push(i);
    }

    for (let i = 0; i < sequence.length; i++) {
      const nodeIdx = sequence[i];
      setActiveTreeNodeIndex(nodeIdx);
      setVisitedRibbon(prev => [...prev, binaryTreeNodes[nodeIdx]]);
      await new Promise(r => setTimeout(r, 550));
    }
    setActiveTreeNodeIndex(null);
    setStatusMessage(`Completed ${mode.toUpperCase()} traversal: [ ${sequence.map(i => binaryTreeNodes[i]).join(' → ')} ]`);
  };

  // -------------------------------------------------------------
  // 10. BINARY SEARCH TREE (BST)
  // -------------------------------------------------------------
  const [bstKeys, setBstKeys] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [activeBstNode, setActiveBstNode] = useState<number | null>(null);

  const insertBstKey = (val: number) => {
    if (bstKeys.includes(val)) {
      setStatusMessage(`Key ${val} already exists in BST.`);
      return;
    }
    setBstKeys(prev => [...prev, val]);
    setStatusMessage(`Inserted ${val} into BST according to L < Root < R property.`);
  };

  const handleBstSearch = async () => {
    const target = parseInt(inputValue, 10);
    if (isNaN(target)) return;
    setStatusMessage(`Searching for ${target} in BST...`);
    setActiveBstNode(null);

    let curr = bstRoot;
    let found = false;
    while (curr) {
      setActiveBstNode(curr.val);
      if (curr.val === target) {
        setStatusMessage(`🎯 FOUND target ${target} in BST!`);
        found = true;
        break;
      } else if (target < curr.val) {
        setStatusMessage(`Target ${target} < ${curr.val} → Branching LEFT`);
        await new Promise(r => setTimeout(r, 600));
        curr = curr.left;
      } else {
        setStatusMessage(`Target ${target} > ${curr.val} → Branching RIGHT`);
        await new Promise(r => setTimeout(r, 600));
        curr = curr.right;
      }
    }
    if (!found) setStatusMessage(`Target ${target} not found in BST.`);
  };

  const handleBstKthSmallest = () => {
    const k = parseInt(indexInput, 10) || 1;
    const sorted = [...bstKeys].sort((a, b) => a - b);
    if (k < 1 || k > sorted.length) return;
    const res = sorted[k - 1];
    setActiveBstNode(res);
    setStatusMessage(`K-th Smallest (k = ${k}): Found [${res}] via Inorder traversal ranking.`);
  };

  // -------------------------------------------------------------
  // 11. AVL SELF-BALANCING TREE
  // -------------------------------------------------------------
  const [avlKeys, setAvlKeys] = useState<number[]>([50, 25, 75, 12, 35, 65, 90]);
  const [lastRotation, setLastRotation] = useState<string | null>(null);
  const [activeAvlNode, setActiveAvlNode] = useState<number | null>(null);

  const getHeight = (n?: BSTNode): number => (n ? n.height : 0);
  const getBalance = (n?: BSTNode): number => (n ? getHeight(n.left) - getHeight(n.right) : 0);

  const rightRotate = (y: BSTNode): BSTNode => {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    return x;
  };

  const leftRotate = (x: BSTNode): BSTNode => {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    return y;
  };

  const insertAvlNode = (node: BSTNode | undefined, key: number): BSTNode => {
    if (!node) return { id: `avl-${key}`, val: key, height: 1 };
    if (key < node.val) node.left = insertAvlNode(node.left, key);
    else if (key > node.val) node.right = insertAvlNode(node.right, key);
    else return node;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    const balance = getBalance(node);

    if (balance > 1 && key < node.left!.val) {
      setLastRotation(`LL Rotation (Right Rotate on ${node.val})`);
      return rightRotate(node);
    }
    if (balance < -1 && key > node.right!.val) {
      setLastRotation(`RR Rotation (Left Rotate on ${node.val})`);
      return leftRotate(node);
    }
    if (balance > 1 && key > node.left!.val) {
      setLastRotation(`LR Double Rotation (Left on ${node.left!.val}, Right on ${node.val})`);
      node.left = leftRotate(node.left!);
      return rightRotate(node);
    }
    if (balance < -1 && key < node.right!.val) {
      setLastRotation(`RL Double Rotation (Right on ${node.right!.val}, Left on ${node.val})`);
      node.right = rightRotate(node.right!);
      return leftRotate(node);
    }
    return node;
  };

  let avlRoot: BSTNode | undefined = undefined;
  for (const k of avlKeys) avlRoot = insertAvlNode(avlRoot, k);

  let bstRoot: BSTNode | undefined = undefined;
  const insertPlainBst = (n: BSTNode | undefined, val: number): BSTNode => {
    if (!n) return { id: `bst-${val}`, val, height: 1 };
    if (val < n.val) n.left = insertPlainBst(n.left, val);
    else if (val > n.val) n.right = insertPlainBst(n.right, val);
    return n;
  };
  for (const k of bstKeys) bstRoot = insertPlainBst(bstRoot, k);

  const layoutTree = (node: BSTNode | undefined, x: number, y: number, spread: number): void => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) layoutTree(node.left, x - spread, y + 80, spread * 0.52);
    if (node.right) layoutTree(node.right, x + spread, y + 80, spread * 0.52);
  };
  layoutTree(avlRoot, 380, 45, 170);
  layoutTree(bstRoot, 380, 45, 170);

  const handleAvlInsert = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      if (avlKeys.includes(val)) {
        setStatusMessage(`Key ${val} already in AVL tree.`);
        return;
      }
      setLastRotation(null);
      setAvlKeys(prev => [...prev, val]);
      setStatusMessage(`Inserted ${val} into AVL Tree. Balance factors recalculated and rotations applied if needed.`);
    }
  };

  const handleAvlSearch = async () => {
    const target = parseInt(inputValue, 10);
    if (isNaN(target)) return;
    setStatusMessage(`Searching for key ${target} in AVL Tree...`);
    setActiveAvlNode(null);

    let curr = avlRoot;
    let found = false;
    while (curr) {
      setActiveAvlNode(curr.val);
      if (curr.val === target) {
        setStatusMessage(`🎯 FOUND key ${target} in AVL Tree in O(log n) time!`);
        found = true;
        break;
      } else if (target < curr.val) {
        setStatusMessage(`Target ${target} < ${curr.val} → Branching LEFT`);
        await new Promise(r => setTimeout(r, 600));
        curr = curr.left;
      } else {
        setStatusMessage(`Target ${target} > ${curr.val} → Branching RIGHT`);
        await new Promise(r => setTimeout(r, 600));
        curr = curr.right;
      }
    }
    if (!found) setStatusMessage(`Target key ${target} not found in AVL Tree.`);
  };

  // -------------------------------------------------------------
  // 12. RED-BLACK BALANCED TREE
  // -------------------------------------------------------------
  const [rbKeys, setRbKeys] = useState<number[]>([20, 10, 30, 5, 15, 25, 40]);
  const [activeRbNode, setActiveRbNode] = useState<number | null>(null);

  const handleRbInsert = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      if (rbKeys.includes(val)) {
        setStatusMessage(`Key ${val} already in Red-Black tree.`);
        return;
      }
      setRbKeys(prev => [...prev, val]);
      setStatusMessage(`Inserted key ${val} (initially RED). Evaluated uncle color and resolved double-red violations.`);
    }
  };

  // -------------------------------------------------------------
  // 13. SEGMENT TREE (RANGE QUERIES & POINT UPDATES)
  // -------------------------------------------------------------
  const [segArray, setSegArray] = useState<number[]>([1, 3, 5, 7, 9, 11]);
  const [segMode, setSegMode] = useState<'sum' | 'min' | 'max'>('sum');
  const [activeSegNodes, setActiveSegNodes] = useState<{ [nodeId: string]: 'contributing' | 'split' | 'disjoint' }>({});
  const [segQueryResult, setSegQueryResult] = useState<number | null>(null);

  interface SegNode {
    id: string;
    l: number;
    r: number;
    val: number;
    left?: SegNode;
    right?: SegNode;
    x?: number;
    y?: number;
  }

  const buildSegmentTree = (l: number, r: number, arr: number[]): SegNode => {
    if (l === r) return { id: `seg-${l}-${r}`, l, r, val: arr[l] };
    const mid = Math.floor((l + r) / 2);
    const left = buildSegmentTree(l, mid, arr);
    const right = buildSegmentTree(mid + 1, r, arr);
    let val = 0;
    if (segMode === 'sum') val = left.val + right.val;
    else if (segMode === 'min') val = Math.min(left.val, right.val);
    else if (segMode === 'max') val = Math.max(left.val, right.val);
    return { id: `seg-${l}-${r}`, l, r, val, left, right };
  };

  const segRoot = buildSegmentTree(0, segArray.length - 1, segArray);

  const layoutSegTree = (node: SegNode | undefined, x: number, y: number, spread: number): void => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) layoutSegTree(node.left, x - spread, y + 80, spread * 0.5);
    if (node.right) layoutSegTree(node.right, x + spread, y + 80, spread * 0.5);
  };
  layoutSegTree(segRoot, 380, 45, 180);

  const handleSegRangeQuery = async () => {
    const ql = parseInt(rangeLeft, 10);
    const qr = parseInt(rangeRight, 10);
    if (isNaN(ql) || isNaN(qr) || ql < 0 || qr >= segArray.length || ql > qr) {
      setStatusMessage(`Please enter valid query range [L, R] between 0 and ${segArray.length - 1}.`);
      return;
    }

    setStatusMessage(`Running Range ${segMode.toUpperCase()} Query on interval [${ql}, ${qr}] in O(log n)...`);
    const statusMap: { [nodeId: string]: 'contributing' | 'split' | 'disjoint' } = {};

    const queryRec = (node?: SegNode): number => {
      if (!node) return 0;
      if (node.l >= ql && node.r <= qr) {
        statusMap[node.id] = 'contributing';
        return node.val;
      }
      if (node.r < ql || node.l > qr) {
        statusMap[node.id] = 'disjoint';
        return segMode === 'min' ? Infinity : segMode === 'max' ? -Infinity : 0;
      }
      statusMap[node.id] = 'split';
      const lVal = queryRec(node.left);
      const rVal = queryRec(node.right);
      if (segMode === 'sum') return lVal + rVal;
      if (segMode === 'min') return Math.min(lVal, rVal);
      return Math.max(lVal, rVal);
    };

    const res = queryRec(segRoot);
    setActiveSegNodes(statusMap);
    setSegQueryResult(res);
    setStatusMessage(`🎯 Range ${segMode.toUpperCase()}([${ql}, ${qr}]) = ${res}. Highlighted contributing interval segments in green.`);
  };

  const handleSegPointUpdate = () => {
    const idx = parseInt(indexInput, 10);
    const val = parseInt(inputValue, 10);
    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= segArray.length) {
      setStatusMessage(`Please enter valid index (0..${segArray.length - 1}) and value.`);
      return;
    }
    const nextArr = [...segArray];
    nextArr[idx] = val;
    setSegArray(nextArr);
    setStatusMessage(`Point Update: A[${idx}] = ${val}. Propagated new summaries upward to root.`);
    setActiveSegNodes({});
    setSegQueryResult(null);
  };

  // -------------------------------------------------------------
  // 14. TRIE (PREFIX DICTIONARY TREE WITH FULL-WIDTH EXPANSION)
  // -------------------------------------------------------------
  const [trieWords, setTrieWords] = useState<string[]>(['kranth', 'uday', 'cat', 'car', 'card', 'care']);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [trieActivePath, setTrieActivePath] = useState<string[]>([]);

  const buildTrie = (words: string[]): TrieVisualNode => {
    const root: TrieVisualNode = { id: 'root', char: 'ROOT', isEnd: false, children: {} };
    for (const word of words) {
      let curr = root;
      for (let i = 0; i < word.length; i++) {
        const ch = word[i].toLowerCase();
        if (!curr.children[ch]) {
          curr.children[ch] = { id: `${curr.id}-${ch}`, char: ch, isEnd: false, children: {} };
        }
        curr = curr.children[ch];
        if (i === word.length - 1) {
          curr.isEnd = true;
          curr.fullWord = word;
        }
      }
    }
    return root;
  };

  const layoutTrieTree = (node: TrieVisualNode, x: number, y: number, spread: number): void => {
    node.x = x;
    node.y = y;
    const childKeys = Object.keys(node.children).sort();
    const count = childKeys.length;
    if (count === 0) return;
    const step = count > 1 ? spread / (count - 1) : 0;
    const startX = count === 1 ? x : x - spread / 2;
    childKeys.forEach((k, idx) => {
      const childX = count === 1 ? x : startX + idx * step;
      const childY = y + 55;
      layoutTrieTree(node.children[k], childX, childY, Math.max(spread * 0.48, 35));
    });
  };

  const trieRoot = buildTrie(trieWords);
  layoutTrieTree(trieRoot, 380, 35, 340);

  const handleTrieInsert = () => {
    const word = strValue.trim().toLowerCase();
    if (word) {
      if (!trieWords.includes(word)) {
        setTrieWords(prev => [...prev, word]);
        setStatusMessage(`Inserted word "${word}" into Trie prefix tree in O(L) time.`);
      } else {
        setStatusMessage(`Word "${word}" already exists in Trie.`);
      }
    }
  };

  const handleTrieSearch = async () => {
    const word = strValue.trim().toLowerCase();
    if (!word) return;
    setStatusMessage(`Searching for word "${word}" character by character...`);
    setTrieActivePath([]);

    const path: string[] = ['root'];
    let curr = trieRoot;
    let found = true;

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (curr.children[ch]) {
        curr = curr.children[ch];
        path.push(curr.id);
        setTrieActivePath([...path]);
        setStatusMessage(`Matched prefix "${word.slice(0, i + 1)}" at node [${ch.toUpperCase()}]`);
        await new Promise(r => setTimeout(r, 450));
      } else {
        found = false;
        break;
      }
    }

    if (found && curr.isEnd) {
      setStatusMessage(`🎯 FOUND exact word "${word}" in Trie! Terminal node verified.`);
    } else {
      setStatusMessage(`"${word}" not found in Trie.`);
    }
  };

  const handleTriePrefixSearch = () => {
    const prefix = strValue.trim().toLowerCase();
    if (prefix) {
      const matches = trieWords.filter(w => w.startsWith(prefix));
      setAutocompleteSuggestions(matches);
      setStatusMessage(`Prefix Search ("${prefix}"): Found ${matches.length} autocomplete matches: [ ${matches.join(', ')} ]`);
    }
  };

  // -------------------------------------------------------------
  // 15. HEAP / PRIORITY QUEUE (FULL HEIGHT SVG TREE + 1D ARRAY + HEAP SORT)
  // -------------------------------------------------------------
  const [heapArray, setHeapArray] = useState<number[]>([10, 15, 20, 40, 50, 100, 25]);
  const [heapType, setHeapType] = useState<'min' | 'max'>('min');
  const [activeHeapIndex, setActiveHeapIndex] = useState<number | null>(null);
  const [heapSortOutput, setHeapSortOutput] = useState<number[]>([]);

  const handleHeapPush = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    if (heapArray.length >= 15) {
      setStatusMessage('Heap capacity limit (15 nodes) reached!');
      return;
    }
    const nextHeap = [...heapArray, val];
    let i = nextHeap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      const cond = heapType === 'min' ? nextHeap[i] < nextHeap[p] : nextHeap[i] > nextHeap[p];
      if (cond) {
        const tmp = nextHeap[i];
        nextHeap[i] = nextHeap[p];
        nextHeap[p] = tmp;
        i = p;
      } else break;
    }
    setHeapArray(nextHeap);
    setActiveHeapIndex(i);
    setStatusMessage(`Pushed ${val} into ${heapType.toUpperCase()}-Heap. Bubbled up to index [${i}] in O(log n).`);
  };

  const handleHeapExtractRoot = () => {
    if (heapArray.length === 0) return;
    const rootVal = heapArray[0];
    const nextHeap = [...heapArray];
    const last = nextHeap.pop()!;
    if (nextHeap.length > 0) {
      nextHeap[0] = last;
      let i = 0;
      while (true) {
        let target = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < nextHeap.length) {
          const condL = heapType === 'min' ? nextHeap[left] < nextHeap[target] : nextHeap[left] > nextHeap[target];
          if (condL) target = left;
        }
        if (right < nextHeap.length) {
          const condR = heapType === 'min' ? nextHeap[right] < nextHeap[target] : nextHeap[right] > nextHeap[target];
          if (condR) target = right;
        }
        if (target !== i) {
          const tmp = nextHeap[i];
          nextHeap[i] = nextHeap[target];
          nextHeap[target] = tmp;
          i = target;
        } else break;
      }
    }
    setHeapArray(nextHeap);
    setActiveHeapIndex(null);
    setHeapSortOutput(prev => [...prev, rootVal]);
    setStatusMessage(`Extract-${heapType === 'min' ? 'Min' : 'Max'}: Ejected Root [${rootVal}]. Sift-down restored ${heapType.toUpperCase()}-Heap in O(log n).`);
  };

  const handleHeapify = () => {
    const raw = [65, 12, 80, 24, 5, 90, 33, 48];
    const arr = [...raw];
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      let curr = i;
      while (true) {
        let target = curr;
        const l = 2 * curr + 1;
        const r = 2 * curr + 2;
        if (l < n && (heapType === 'min' ? arr[l] < arr[target] : arr[l] > arr[target])) target = l;
        if (r < n && (heapType === 'min' ? arr[r] < arr[target] : arr[r] > arr[target])) target = r;
        if (target !== curr) {
          const tmp = arr[curr];
          arr[curr] = arr[target];
          arr[target] = tmp;
          curr = target;
        } else break;
      }
    }
    setHeapArray(arr);
    setActiveHeapIndex(0);
    setHeapSortOutput([]);
    setStatusMessage(`Floyd's Heapify: Built valid ${heapType.toUpperCase()}-Heap from [${raw.join(', ')}] in O(n) linear time!`);
  };

  const handleHeapSort = async () => {
    setStatusMessage('Running Complete Heap Sort Animation: Extracting Root repeatedly...');
    let h = [...heapArray];
    const sorted: number[] = [];
    while (h.length > 0) {
      const minVal = h[0];
      sorted.push(minVal);
      setHeapSortOutput([...sorted]);
      const last = h.pop()!;
      if (h.length > 0) {
        h[0] = last;
        let i = 0;
        while (true) {
          let target = i;
          const l = 2 * i + 1;
          const r = 2 * i + 2;
          if (l < h.length && (heapType === 'min' ? h[l] < h[target] : h[l] > h[target])) target = l;
          if (r < h.length && (heapType === 'min' ? h[r] < h[target] : h[r] > h[target])) target = r;
          if (target !== i) {
            const tmp = h[i];
            h[i] = h[target];
            h[target] = tmp;
            i = target;
          } else break;
        }
      }
      setHeapArray([...h]);
      await new Promise(r => setTimeout(r, 600));
    }
    setStatusMessage(`🎉 Heap Sort Complete! Sorted Array: [ ${sorted.join(', ')} ] in O(n log n) time.`);
  };

  // -------------------------------------------------------------
  // 16. B-TREE (2-3-4 MULTI-WAY TREE)
  // -------------------------------------------------------------
  const [bTreeKeys, setBTreeKeys] = useState<number[]>([10, 20, 30, 40, 50, 60, 70, 80]);
  const [activeBTreeNodeId, setActiveBTreeNodeId] = useState<string | null>(null);

  const build234Tree = (keys: number[]): BTree234Node => {
    let root: BTree234Node = { id: 'root', keys: [], children: [], isLeaf: true };

    const splitChild = (parent: BTree234Node, idx: number) => {
      const fullChild = parent.children[idx];
      const medianKey = fullChild.keys[1];
      const leftChild: BTree234Node = {
        id: `${fullChild.id}-l`,
        keys: [fullChild.keys[0]],
        children: fullChild.isLeaf ? [] : [fullChild.children[0], fullChild.children[1]],
        isLeaf: fullChild.isLeaf
      };
      const rightChild: BTree234Node = {
        id: `${fullChild.id}-r`,
        keys: [fullChild.keys[2]],
        children: fullChild.isLeaf ? [] : [fullChild.children[2], fullChild.children[3]],
        isLeaf: fullChild.isLeaf
      };

      parent.keys.splice(idx, 0, medianKey);
      parent.children.splice(idx, 1, leftChild, rightChild);
    };

    const insertNonFull = (node: BTree234Node, k: number) => {
      let i = node.keys.length - 1;
      if (node.isLeaf) {
        node.keys.push(k);
        node.keys.sort((a, b) => a - b);
      } else {
        while (i >= 0 && k < node.keys[i]) i--;
        i++;
        if (node.children[i].keys.length === 3) {
          splitChild(node, i);
          if (k > node.keys[i]) i++;
        }
        insertNonFull(node.children[i], k);
      }
    };

    for (const k of keys) {
      if (root.keys.length === 3) {
        const newRoot: BTree234Node = {
          id: `root-${Date.now()}`,
          keys: [],
          children: [root],
          isLeaf: false
        };
        splitChild(newRoot, 0);
        root = newRoot;
      }
      insertNonFull(root, k);
    }
    return root;
  };

  const layout234Tree = (node: BTree234Node, x: number, y: number, spread: number): void => {
    node.x = x;
    node.y = y;
    const n = node.children.length;
    if (n === 0) return;
    const step = spread / (n > 1 ? n - 1 : 1);
    const startX = n === 1 ? x : x - spread / 2;
    node.children.forEach((c, idx) => {
      const cx = n === 1 ? x : startX + idx * step;
      layout234Tree(c, cx, y + 80, Math.max(spread * 0.48, 50));
    });
  };

  const bTreeRoot = build234Tree(bTreeKeys);
  layout234Tree(bTreeRoot, 380, 45, 340);

  const handleBTreeInsert = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      if (bTreeKeys.includes(val)) return;
      setBTreeKeys(prev => [...prev, val]);
      setStatusMessage(`Inserted ${val} into 2-3-4 B-Tree. Proactive node splitting maintained balance.`);
    }
  };

  const handleBTreeSearch = async () => {
    const target = parseInt(inputValue, 10);
    if (isNaN(target)) return;
    setStatusMessage(`Searching for key ${target} in 2-3-4 Tree...`);
    setActiveBTreeNodeId(null);

    let curr: BTree234Node | null = bTreeRoot;
    let found = false;
    while (curr) {
      setActiveBTreeNodeId(curr.id);
      await new Promise(r => setTimeout(r, 600));
      if (curr.keys.includes(target)) {
        setStatusMessage(`🎯 FOUND key ${target} inside multi-key node [ ${curr.keys.join(', ')} ]!`);
        found = true;
        break;
      }
      if (curr.isLeaf) break;
      let nextIdx = 0;
      while (nextIdx < curr.keys.length && target > curr.keys[nextIdx]) nextIdx++;
      curr = curr.children[nextIdx] || null;
    }
    if (!found) setStatusMessage(`Key ${target} not found in 2-3-4 Tree.`);
  };

  // -------------------------------------------------------------
  // 17. DISJOINT SETS (UNION-FIND BY RANK & PATH COMPRESSION)
  // -------------------------------------------------------------
  const [dsuParent, setDsuParent] = useState<number[]>([0, 0, 0, 3, 3, 5, 5, 5]);
  const [dsuRank, setDsuRank] = useState<number[]>([2, 0, 0, 1, 0, 1, 0, 0]);
  const [activeDsuNodes, setActiveDsuNodes] = useState<number[]>([]);

  const findRoot = (i: number, parents: number[]): number => {
    if (parents[i] === i) return i;
    return findRoot(parents[i], parents);
  };

  const handleDsuUnion = () => {
    const u = parseInt(inputValue, 10);
    const v = parseInt(secondaryInput, 10);
    if (isNaN(u) || isNaN(v) || u < 0 || u >= dsuParent.length || v < 0 || v >= dsuParent.length) {
      setStatusMessage(`Please enter valid element IDs (0..${dsuParent.length - 1}).`);
      return;
    }
    const rootU = findRoot(u, dsuParent);
    const rootV = findRoot(v, dsuParent);

    if (rootU !== rootV) {
      const nextParents = [...dsuParent];
      const nextRanks = [...dsuRank];
      if (nextRanks[rootU] < nextRanks[rootV]) {
        nextParents[rootU] = rootV;
      } else if (nextRanks[rootU] > nextRanks[rootV]) {
        nextParents[rootV] = rootU;
      } else {
        nextParents[rootV] = rootU;
        nextRanks[rootU]++;
      }
      setDsuParent(nextParents);
      setDsuRank(nextRanks);
      setActiveDsuNodes([u, v, rootU, rootV]);
      setStatusMessage(`Union(${u}, ${v}): Linked Set(${rootV}) under Root(${rootU}) by rank in O(α(n)) time.`);
    } else {
      setStatusMessage(`Elements ${u} and ${v} are already in the same connected set (Root ${rootU}).`);
    }
  };

  const handleDsuFindWithCompression = async () => {
    const u = parseInt(inputValue, 10);
    if (isNaN(u) || u < 0 || u >= dsuParent.length) return;
    setStatusMessage(`Find(${u}) with Path Compression: Traversing up to root...`);
    const path: number[] = [];
    let curr = u;
    while (dsuParent[curr] !== curr) {
      path.push(curr);
      curr = dsuParent[curr];
    }
    path.push(curr);
    const root = curr;
    setActiveDsuNodes([...path]);
    await new Promise(r => setTimeout(r, 600));

    const nextP = [...dsuParent];
    path.forEach(node => { nextP[node] = root; });
    setDsuParent(nextP);
    setStatusMessage(`🎯 Find(${u}) = Root [${root}]. Path Compressed: Visited nodes [${path.join(', ')}] now point directly to Root [${root}]!`);
  };

  const handleDsuConnectedQuery = () => {
    const u = parseInt(inputValue, 10);
    const v = parseInt(secondaryInput, 10);
    if (isNaN(u) || isNaN(v) || u < 0 || u >= dsuParent.length || v < 0 || v >= dsuParent.length) return;
    const rU = findRoot(u, dsuParent);
    const rV = findRoot(v, dsuParent);
    setActiveDsuNodes([u, v]);
    if (rU === rV) {
      setStatusMessage(`✓ CONNECTED: Elements ${u} and ${v} share the same Root Set [${rU}].`);
    } else {
      setStatusMessage(`✗ DISJOINT: Elements ${u} (Root ${rU}) and ${v} (Root ${rV}) are in separate components.`);
    }
  };

  const getDistinctSetsCount = () => {
    const roots = new Set<number>();
    for (let i = 0; i < dsuParent.length; i++) roots.add(findRoot(i, dsuParent));
    return roots.size;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto', paddingRight: '6px' }}>
      {/* Top Selector Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {Object.entries(DS_TABS_MAP).map(([tabId, label]) => {
          const isActive = activeDs === tabId;
          return (
            <button
              key={tabId}
              onClick={() => handleSelectDs(tabId)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            background: showCheatsheet ? '#0284c7' : 'rgba(56, 189, 248, 0.1)',
            color: showCheatsheet ? '#fff' : '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Complexity Matrix
        </button>
      </div>

      {/* Primary Interactive Deck & Input Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '12px',
        background: '#090d16',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* 1. ARRAY CONTROLS */}
        {activeDs === 'array_ds' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Val:</span>
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Idx:</span>
              <input type="text" value={indexInput} onChange={e => setIndexInput(e.target.value)} style={{ width: '40px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            </div>
            <button onClick={handleArrayInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert</button>
            <button onClick={handleArrayUpdate} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Update [i]</button>
            <button onClick={handleArrayDelete} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Delete</button>
            <button onClick={handleArrayLinearSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Linear Search</button>
            <button onClick={handleArrayBinarySearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Binary Search</button>
            <button onClick={() => handleArrayRotate('left')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#334155', color: '#fff', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>↶ Shift L</button>
            <button onClick={() => handleArrayRotate('right')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#334155', color: '#fff', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>↷ Shift R</button>
            <button onClick={() => setShowPrefixSum(!showPrefixSum)} style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: '6px', background: showPrefixSum ? '#0284c7' : 'rgba(255,255,255,0.06)', color: showPrefixSum ? '#fff' : '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>Prefix Sum Array</button>
          </>
        )}

        {/* 2. STRING CONTROLS */}
        {activeDs === 'string_ds' && (
          <>
            <input type="text" value={stringBuffer} onChange={e => setStringBuffer(e.target.value)} placeholder="String" style={{ width: '110px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleStringReverse} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Reverse</button>
            <button onClick={handleStringPalindrome} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Palindrome</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <input type="text" value={patternInput} onChange={e => setPatternInput(e.target.value)} placeholder="Pattern" style={{ width: '65px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
              <button onClick={handleStringKmpSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>KMP Search</button>
            </div>
            <button onClick={handleStringCompress} style={{ padding: '6px 10px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Run-Length Encode</button>
          </>
        )}

        {/* 3. SLL CONTROLS */}
        {activeDs === 'singly_linked_list' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <input type="text" value={indexInput} onChange={e => setIndexInput(e.target.value)} placeholder="Idx" style={{ width: '40px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleSllPrepend} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>⇤ Prepend</button>
            <button onClick={handleSllAppend} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Append ⇥</button>
            <button onClick={handleSllInsertAt} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert [i]</button>
            <button onClick={handleSllDeleteVal} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Delete Val</button>
            <button onClick={handleSllFindMiddle} style={{ padding: '6px 10px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Find Middle (Tortoise/Hare)</button>
            <button onClick={handleSllReverse} style={{ padding: '6px 10px', borderRadius: '6px', background: '#475569', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>↻ Reverse</button>
          </>
        )}

        {/* 4. DLL CONTROLS */}
        {activeDs === 'doubly_linked_list' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleDllPrepend} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Prepend Head</button>
            <button onClick={handleDllAppend} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Append Tail</button>
            <button onClick={handleDllReverse} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>↻ Reverse DLL</button>
          </>
        )}

        {/* 5. CLL CONTROLS */}
        {activeDs === 'circular_linked_list' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleCllInsertTail} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert Tail</button>
            <button onClick={handleCllJosephus} style={{ padding: '6px 12px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>👑 Josephus Problem (Step=3)</button>
          </>
        )}

        {/* 6. STACK CONTROLS */}
        {activeDs === 'stack_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Capsule" style={{ width: '60px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleStackPush} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Push Top</button>
            <button onClick={handleStackPop} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Pop Top</button>
            <button onClick={handleStackPeek} style={{ padding: '6px 10px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Peek Top</button>
            <button onClick={handleStackParenCheck} style={{ padding: '6px 12px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Validate "{`{[()]}`}"</button>
          </>
        )}

        {/* 7. QUEUE CONTROLS */}
        {activeDs === 'queue_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Item" style={{ width: '60px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleQueueEnqueueRear} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Enqueue Rear</button>
            <button onClick={handleQueueDequeueFront} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Dequeue Front</button>
            <button onClick={handleQueueEnqueueFront} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Deque Push Front</button>
            <button onClick={handleQueueDequeueRear} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Deque Pop Rear</button>
          </>
        )}

        {/* 8. HASH TABLE CONTROLS */}
        {activeDs === 'hash_table' && (
          <>
            {hashMode === 'hash_map' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="text" value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="Key" style={{ width: '70px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
                <input type="text" value={valueInput} onChange={e => setValueInput(e.target.value)} placeholder="Val" style={{ width: '70px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
                <button onClick={handleHashMapPut} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Put(K, V)</button>
              </div>
            ) : (
              <>
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Key" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
                <button onClick={handleHashInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert Key</button>
              </>
            )}
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              {(['chaining', 'linear_probing', 'quadratic_probing', 'hash_map'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setHashMode(m)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: hashMode === m ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    color: hashMode === m ? '#fff' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {m === 'chaining' ? 'Chaining' : m === 'linear_probing' ? 'Linear' : m === 'quadratic_probing' ? 'Quadratic' : 'Map'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 9. BINARY TREE CONTROLS */}
        {activeDs === 'binary_tree_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleBinaryTreeInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert</button>
            <button onClick={handleBinaryTreeInvert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Invert / Mirror</button>
            <button onClick={() => handleBinaryTreeTraverse('inorder')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>Inorder</button>
            <button onClick={() => handleBinaryTreeTraverse('preorder')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>Preorder</button>
            <button onClick={() => handleBinaryTreeTraverse('postorder')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>Postorder</button>
            <button onClick={() => handleBinaryTreeTraverse('bfs')} style={{ padding: '6px 8px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>BFS Level</button>
          </>
        )}

        {/* 10. BST CONTROLS */}
        {activeDs === 'bst_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={() => { const v = parseInt(inputValue, 10); if (!isNaN(v)) insertBstKey(v); }} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert BST</button>
            <button onClick={handleBstSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Search Path</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <input type="text" value={indexInput} onChange={e => setIndexInput(e.target.value)} placeholder="k" style={{ width: '32px', padding: '5px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
              <button onClick={handleBstKthSmallest} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>K-th Smallest</button>
            </div>
            <button onClick={() => { setBstKeys([50, 30, 70, 20, 40, 60, 80]); setActiveBstNode(null); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example</button>
          </>
        )}

        {/* 11. AVL CONTROLS */}
        {activeDs === 'avl_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleAvlInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert & Balance</button>
            <button onClick={handleAvlSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Search</button>
            {lastRotation && (
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, background: 'rgba(245,158,11,0.15)', padding: '3px 6px', borderRadius: '6px' }}>
                ⚡ {lastRotation}
              </span>
            )}
            <button onClick={() => { setAvlKeys([50, 25, 75, 12, 35, 65, 90]); setLastRotation(null); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example</button>
          </>
        )}

        {/* 12. RED-BLACK CONTROLS */}
        {activeDs === 'rbtree_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleRbInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert Red-Black</button>
            <button onClick={() => { setRbKeys([20, 10, 30, 5, 15, 25, 40]); setActiveRbNode(null); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example</button>
          </>
        )}

        {/* 13. SEGMENT TREE CONTROLS */}
        {activeDs === 'segment_tree_ds' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Query [L, R]:</span>
              <input type="text" value={rangeLeft} onChange={e => setRangeLeft(e.target.value)} style={{ width: '34px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input type="text" value={rangeRight} onChange={e => setRangeRight(e.target.value)} style={{ width: '34px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
            </div>
            <button onClick={handleSegRangeQuery} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Query</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>A[i]=v:</span>
              <input type="text" value={indexInput} onChange={e => setIndexInput(e.target.value)} placeholder="i" style={{ width: '30px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="v" style={{ width: '38px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
              <button onClick={handleSegPointUpdate} style={{ padding: '6px 8px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Update</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              {(['sum', 'min', 'max'] as const).map(m => (
                <button key={m} onClick={() => { setSegMode(m); setActiveSegNodes({}); setSegQueryResult(null); }} style={{ padding: '4px 8px', borderRadius: '6px', background: segMode === m ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 14. TRIE CONTROLS */}
        {activeDs === 'trie_ds' && (
          <>
            <input type="text" value={strValue} onChange={e => setStrValue(e.target.value)} placeholder="word / prefix" style={{ width: '120px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleTrieInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert Word</button>
            <button onClick={handleTrieSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Search Word</button>
            <button onClick={handleTriePrefixSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Prefix (Autocomplete)</button>
            <button onClick={() => { setTrieWords(['kranth', 'uday', 'cat', 'car', 'card', 'care']); setTrieActivePath([]); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example</button>
          </>
        )}

        {/* 15. HEAP CONTROLS */}
        {activeDs === 'heap_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Val" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleHeapPush} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Push (Bubble Up)</button>
            <button onClick={handleHeapExtractRoot} style={{ padding: '6px 10px', borderRadius: '6px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Extract Root</button>
            <button onClick={handleHeapify} style={{ padding: '6px 10px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Heapify O(n)</button>
            <button onClick={handleHeapSort} style={{ padding: '6px 10px', borderRadius: '6px', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>⚡ Heap Sort</button>
            <button onClick={() => { setHeapType(heapType === 'min' ? 'max' : 'min'); setActiveHeapIndex(null); }} style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid #38bdf8', cursor: 'pointer', fontWeight: 800 }}>
              Mode: {heapType === 'min' ? '🔺 Min-Heap' : '🔻 Max-Heap'}
            </button>
          </>
        )}

        {/* 16. B-TREE CONTROLS */}
        {activeDs === 'b_tree_ds' && (
          <>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Key" style={{ width: '50px', padding: '5px 8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }} />
            <button onClick={handleBTreeInsert} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Insert Key</button>
            <button onClick={handleBTreeSearch} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Multi-Way Search</button>
            <button onClick={() => { setBTreeKeys([10, 20, 30, 40, 50, 60, 70, 80]); setActiveBTreeNodeId(null); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example</button>
          </>
        )}

        {/* 17. DISJOINT SETS CONTROLS */}
        {activeDs === 'disjoint_set_ds' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>u:</span>
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} style={{ width: '32px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
              <span style={{ color: '#94a3b8' }}>v:</span>
              <input type="text" value={secondaryInput} onChange={e => setSecondaryInput(e.target.value)} style={{ width: '32px', padding: '4px 6px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.78rem' }} />
            </div>
            <button onClick={handleDsuUnion} style={{ padding: '6px 10px', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Union(u, v)</button>
            <button onClick={handleDsuFindWithCompression} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Find + Compress</button>
            <button onClick={handleDsuConnectedQuery} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}>Connected?</button>
            <button onClick={() => { setDsuParent([0, 0, 0, 3, 3, 5, 5, 5]); setDsuRank([2, 0, 0, 1, 0, 1, 0, 0]); setActiveDsuNodes([]); }} style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontSize: '0.72rem', border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer' }}>✦ Example Forest</button>
          </>
        )}
      </div>

      {/* Live Narrative Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        fontSize: '0.8rem',
        color: '#e2e8f0'
      }}>
        <CheckCircle2 size={15} color="#38bdf8" />
        <span>{statusMessage}</span>
      </div>

      {/* FULL-CANVAS RESPONSIVE INTERACTIVE VISUAL BOARD (100% HEIGHT OCCUPATION) */}
      <div style={{
        flex: 1,
        minHeight: '440px',
        borderRadius: '14px',
        background: 'radial-gradient(circle at 50% 10%, rgba(15,23,42,0.9), #030712)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* 1. ARRAY CANVAS */}
        {activeDs === 'array_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {Array.from({ length: arrayCapacity }).map((_, idx) => {
                const hasValue = idx < arrayData.length;
                const val = hasValue ? arrayData[idx] : '∅';
                const isHighlighted = highlightedIndices.includes(idx);
                const pLabel = pointerLabels[idx];
                const address = `0x${(baseAddress + idx * 4).toString(16).toUpperCase()}`;

                return (
                  <div key={`arr-slot-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {pLabel ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                        ▼ {pLabel}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>[{idx}]</span>
                    )}
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '10px',
                      background: isHighlighted ? '#f59e0b' : hasValue ? '#0284c7' : 'rgba(30, 41, 59, 0.4)',
                      border: isHighlighted ? '2px solid #fbbf24' : hasValue ? '1px solid #38bdf8' : '1px dashed #334155',
                      color: hasValue ? '#ffffff' : '#475569',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isHighlighted ? '0 0 18px rgba(245, 158, 11, 0.6)' : hasValue ? '0 0 10px rgba(2, 132, 199, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {val}
                    </div>
                    <span style={{ fontSize: '0.62rem', color: '#475569', fontFamily: 'monospace' }}>{address}</span>
                  </div>
                );
              })}
            </div>

            {showPrefixSum && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'rgba(15,23,42,0.6)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Prefix Sum Array P[i] = ∑ A[0..i] (Range Queries in O(1)):</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(() => {
                    let sum = 0;
                    return arrayData.map((v, i) => {
                      sum += v;
                      return (
                        <div key={`pref-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>P[{i}]</span>
                          <span style={{ padding: '4px 8px', background: '#059669', color: '#fff', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>{sum}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Size = <strong>{arrayData.length}</strong> / Capacity = <strong>{arrayCapacity}</strong> · 4 Bytes/Slot
            </div>
          </div>
        )}

        {/* 2. STRING CANVAS */}
        {activeDs === 'string_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {stringBuffer.split('').map((char, idx) => {
                const isLeft = stringPointers.left === idx;
                const isRight = stringPointers.right === idx;
                const isHighlighted = isLeft || isRight;

                return (
                  <div key={`str-char-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {isLeft && <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>▼ L</span>}
                    {isRight && <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 800 }}>▼ R</span>}
                    {!isHighlighted && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>[{idx}]</span>}

                    <div style={{
                      width: '48px',
                      height: '56px',
                      borderRadius: '10px',
                      background: isHighlighted ? '#1e1b4b' : '#0f172a',
                      border: isHighlighted ? '2px solid #a855f7' : '1px solid #334155',
                      color: isHighlighted ? '#c084fc' : '#ffffff',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isHighlighted ? '0 0 16px rgba(168, 85, 247, 0.5)' : 'none'
                    }}>
                      '{char}'
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                      ASCII {char.charCodeAt(0)}
                    </span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>[{stringBuffer.length}]</span>
                <div style={{ width: '48px', height: '56px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed #334155', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  \0
                </div>
                <span style={{ fontSize: '0.65rem', color: '#475569' }}>NULL</span>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Length = <strong>{stringBuffer.length}</strong> chars · Terminated with Null Byte (\0)</span>
          </div>
        )}

        {/* 3. SLL CANVAS */}
        {activeDs === 'singly_linked_list' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', padding: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginRight: '6px' }}>HEAD →</span>
            {sllNodes.map((node, idx) => {
              const isActive = activeSllId === node.id;
              const isSlow = sllCyclePointers.slow === node.id;
              const isFast = sllCyclePointers.fast === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {(isSlow || isFast) && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isSlow ? '#38bdf8' : '#f59e0b', background: 'rgba(0,0,0,0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                        {isSlow && isFast ? '🐢🐇 Slow & Fast' : isSlow ? '🐢 Slow' : '🐇 Fast'}
                      </span>
                    )}
                    <div style={{
                      display: 'flex',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: isActive ? '2px solid #fbbf24' : '1px solid #38bdf8',
                      boxShadow: isActive ? '0 0 18px rgba(251, 191, 36, 0.6)' : '0 0 10px rgba(56, 189, 248, 0.2)',
                      background: '#0f172a'
                    }}>
                      <div style={{ padding: '12px 16px', background: isActive ? '#f59e0b' : '#0284c7', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                        {node.val}
                      </div>
                      <div style={{ padding: '12px 10px', background: '#1e293b', color: '#38bdf8', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                        •
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>0x{(0x200 + idx * 16).toString(16).toUpperCase()}</span>
                  </div>
                  {idx < sllNodes.length - 1 ? (
                    <ArrowRight size={22} color="#38bdf8" />
                  ) : (
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e', marginLeft: '6px' }}>→ NULL</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* 4. DLL CANVAS */}
        {activeDs === 'doubly_linked_list' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', padding: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>HEAD ↔</span>
            {dllNodes.map((node, idx) => {
              return (
                <React.Fragment key={node.id}>
                  <div style={{
                    display: 'flex',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #38bdf8',
                    background: '#0f172a'
                  }}>
                    <div style={{ padding: '10px 8px', background: '#1e293b', color: '#a855f7', fontSize: '0.75rem' }}>prev</div>
                    <div style={{ padding: '10px 16px', background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{node.val}</div>
                    <div style={{ padding: '10px 8px', background: '#1e293b', color: '#10b981', fontSize: '0.75rem' }}>next</div>
                  </div>
                  {idx < dllNodes.length - 1 && <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.2rem' }}>⇄</span>}
                </React.Fragment>
              );
            })}
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e' }}>↔ TAIL</span>
          </div>
        )}

        {/* 5. CLL CANVAS */}
        {activeDs === 'circular_linked_list' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="340" height="280" viewBox="0 0 340 280">
              <circle cx="170" cy="140" r="100" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2.5" strokeDasharray="5 5" />
              {cllNodes.map((val, idx) => {
                const total = cllNodes.length;
                const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                const cx = 170 + 100 * Math.cos(angle);
                const cy = 140 + 100 * Math.sin(angle);
                const isActive = activeCllIdx === idx;

                return (
                  <g key={`cll-${idx}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="22"
                      fill={isActive ? '#f59e0b' : idx === 0 ? '#10b981' : '#0284c7'}
                      stroke={isActive ? '#fbbf24' : '#38bdf8'}
                      strokeWidth="2.5"
                    />
                    <text x={cx} y={cy + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                );
              })}
              <text x="170" y="145" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">↻ Ring</text>
            </svg>
          </div>
        )}

        {/* 6. STACK CANVAS */}
        {activeDs === 'stack_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, marginBottom: '8px' }}>
              ▲ TOP HATCH (LIFO Exit / Entry)
            </span>
            <div style={{
              width: '160px',
              minHeight: '260px',
              borderLeft: '3px solid #38bdf8',
              borderRight: '3px solid #38bdf8',
              borderBottom: '3px solid #38bdf8',
              borderRadius: '0 0 14px 14px',
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column-reverse',
              padding: '8px',
              gap: '8px'
            }}>
              {stackCapsules.map((val, idx) => (
                <div key={`stk-${idx}`} style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: idx === stackCapsules.length - 1 ? '#f59e0b' : '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  boxShadow: idx === stackCapsules.length - 1 ? '0 0 14px rgba(245, 158, 11, 0.6)' : 'none'
                }}>
                  [{idx}] {val} {idx === stackCapsules.length - 1 ? '← TOP' : ''}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>Bottom of Stack (Index 0)</span>
          </div>
        )}

        {/* 7. QUEUE CANVAS */}
        {activeDs === 'queue_ds' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e' }}>FRONT (Exit) ◄</span>
            <div style={{ display: 'flex', gap: '8px', padding: '14px', borderTop: '2px solid #38bdf8', borderBottom: '2px solid #38bdf8' }}>
              {queueItems.map((val, idx) => (
                <div key={`q-${idx}`} style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  background: idx === 0 ? '#f43f5e' : idx === queueItems.length - 1 ? '#10b981' : '#0284c7',
                  color: '#fff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {val}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>◄ REAR (Enter)</span>
          </div>
        )}

        {/* 8. HASH TABLE CANVAS */}
        {activeDs === 'hash_table' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
              Formula: <strong>h(k) = k mod {tableSize}</strong> · Load Factor: <strong>{(probingTable.filter(v => v !== null).length / tableSize).toFixed(2)}</strong>
            </div>
            {hashMode === 'chaining' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chainingTable.map((bucket, idx) => (
                  <div key={`bucket-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '65px', padding: '6px', background: '#1e293b', borderRadius: '6px', textAlign: 'center', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                      [{idx}]
                    </div>
                    <ArrowRight size={16} color="#64748b" />
                    {bucket.length === 0 ? (
                      <span style={{ color: '#475569', fontSize: '0.75rem' }}>NULL</span>
                    ) : (
                      bucket.map((val, bIdx) => (
                        <React.Fragment key={`b-${idx}-${bIdx}`}>
                          <div style={{ padding: '6px 14px', background: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                            {val}
                          </div>
                          {bIdx < bucket.length - 1 && <span style={{ color: '#38bdf8' }}>→</span>}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                ))}
              </div>
            ) : hashMode === 'linear_probing' || hashMode === 'quadratic_probing' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {probingTable.map((val, idx) => (
                  <div key={`probe-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>[{idx}]</span>
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: val !== null ? '#0284c7' : 'rgba(255,255,255,0.04)', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                      {val !== null ? val : '∅'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hashMapEntries.map((e, idx) => (
                  <div key={`hmap-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace' }}>Bucket [{e.hash}]</span>
                    <strong style={{ color: '#fff' }}>"{e.key}"</strong>
                    <span style={{ color: '#94a3b8' }}>:</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>"{e.value}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. GENERAL BINARY TREE (FULL CANVAS 100% HEIGHT) */}
        {activeDs === 'binary_tree_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Nodes = <strong>{binaryTreeNodes.length}</strong> · Root = <strong>{binaryTreeNodes[0] || '—'}</strong> · Height = <strong>{binaryTreeNodes.length > 0 ? Math.floor(Math.log2(binaryTreeNodes.length)) : 0}</strong>
              </span>
              {visitedRibbon.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                  <Sparkles size={14} />
                  <span>Sequence: [ {visitedRibbon.join(' → ')} ]</span>
                </div>
              )}
            </div>

            <svg viewBox="0 0 760 380" style={{ width: '100%', flex: 1, minHeight: '320px' }}>
              {binaryTreeNodes.map((_, idx) => {
                if (idx === 0) return null;
                const parentIdx = Math.floor((idx - 1) / 2);
                const level = Math.floor(Math.log2(idx + 1));
                const posInLevel = idx - (Math.pow(2, level) - 1);
                const countInLevel = Math.pow(2, level);
                const x = (760 / (countInLevel + 1)) * (posInLevel + 1);
                const y = 45 + level * 80;

                const pLevel = Math.floor(Math.log2(parentIdx + 1));
                const pPosInLevel = parentIdx - (Math.pow(2, pLevel) - 1);
                const pCountInLevel = Math.pow(2, pLevel);
                const px = (760 / (pCountInLevel + 1)) * (pPosInLevel + 1);
                const py = 45 + pLevel * 80;

                return <line key={`bt-line-${idx}`} x1={px} y1={py} x2={x} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />;
              })}

              {binaryTreeNodes.map((val, idx) => {
                const level = Math.floor(Math.log2(idx + 1));
                const posInLevel = idx - (Math.pow(2, level) - 1);
                const countInLevel = Math.pow(2, level);
                const x = (760 / (countInLevel + 1)) * (posInLevel + 1);
                const y = 45 + level * 80;
                const isActive = activeTreeNodeIndex === idx;

                return (
                  <g key={`bt-node-${idx}`}>
                    <circle cx={x} cy={y} r="24" fill={isActive ? '#f59e0b' : idx === 0 ? '#10b981' : '#1e293b'} stroke={isActive ? '#fbbf24' : '#38bdf8'} strokeWidth="3" style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }} />
                    <text x={x} y={y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">{val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* 10. BST (FULL CANVAS 100% HEIGHT) */}
        {activeDs === 'bst_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                BST Invariant: <strong>Left &lt; Root &lt; Right</strong> · Sorted In-Order: [ {[...bstKeys].sort((a, b) => a - b).join(', ')} ]
              </span>
            </div>

            <svg viewBox="0 0 760 380" style={{ width: '100%', flex: 1, minHeight: '320px' }}>
              {(() => {
                const lines: React.ReactNode[] = [];
                const drawLines = (n?: BSTNode) => {
                  if (!n || !n.x || !n.y) return;
                  if (n.left && n.left.x && n.left.y) {
                    lines.push(<line key={`bst-line-${n.id}-${n.left.id}`} x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.left);
                  }
                  if (n.right && n.right.x && n.right.y) {
                    lines.push(<line key={`bst-line-${n.id}-${n.right.id}`} x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.right);
                  }
                };
                drawLines(bstRoot);
                return lines;
              })()}

              {(() => {
                const circles: React.ReactNode[] = [];
                const drawNodes = (n?: BSTNode) => {
                  if (!n || !n.x || !n.y) return;
                  const isActive = activeBstNode === n.val;
                  circles.push(
                    <g key={`bst-circle-${n.id}`}>
                      <circle cx={n.x} cy={n.y} r="24" fill={isActive ? '#f59e0b' : '#1e293b'} stroke={isActive ? '#fbbf24' : '#38bdf8'} strokeWidth="3" style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }} />
                      <text x={n.x} y={n.y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">{n.val}</text>
                    </g>
                  );
                  if (n.left) drawNodes(n.left);
                  if (n.right) drawNodes(n.right);
                };
                drawNodes(bstRoot);
                return circles;
              })()}
            </svg>
          </div>
        )}

        {/* 11. AVL TREE (FULL CANVAS 100% HEIGHT) */}
        {activeDs === 'avl_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Rule: <strong>|Balance Factor| ≤ 1</strong> (BF = h_L - h_R)
                </span>
                <span style={{ color: '#10b981', fontSize: '0.75rem' }}>● BF=0</span>
                <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>● BF=±1</span>
                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>● |BF|&gt;1</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                Strict Height Balanced
              </span>
            </div>

            <svg viewBox="0 0 760 380" style={{ width: '100%', flex: 1, minHeight: '320px' }}>
              {(() => {
                const lines: React.ReactNode[] = [];
                const drawLines = (n?: BSTNode) => {
                  if (!n || !n.x || !n.y) return;
                  if (n.left && n.left.x && n.left.y) {
                    lines.push(<line key={`avl-line-${n.id}-${n.left.id}`} x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.left);
                  }
                  if (n.right && n.right.x && n.right.y) {
                    lines.push(<line key={`avl-line-${n.id}-${n.right.id}`} x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.right);
                  }
                };
                drawLines(avlRoot);
                return lines;
              })()}

              {(() => {
                const circles: React.ReactNode[] = [];
                const drawNodes = (n?: BSTNode) => {
                  if (!n || !n.x || !n.y) return;
                  const bf = getBalance(n);
                  const isViolation = Math.abs(bf) > 1;
                  const isActive = activeAvlNode === n.val;
                  const bfColor = isViolation ? '#ef4444' : bf === 0 ? '#10b981' : '#f59e0b';

                  circles.push(
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r="24" fill={isActive ? '#f59e0b' : '#1e293b'} stroke={isViolation ? '#ef4444' : isActive ? '#fbbf24' : '#38bdf8'} strokeWidth="3" style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }} />
                      <text x={n.x} y={n.y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">{n.val}</text>
                      <rect x={n.x + 18} y={n.y - 18} width="32" height="16" rx="4" fill={bfColor} />
                      <text x={n.x + 34} y={n.y - 6} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {bf > 0 ? `+${bf}` : bf}
                      </text>
                    </g>
                  );
                  if (n.left) drawNodes(n.left);
                  if (n.right) drawNodes(n.right);
                };
                drawNodes(avlRoot);
                return circles;
              })()}
            </svg>
          </div>
        )}

        {/* 12. RED-BLACK TREE (FULL CANVAS 100% HEIGHT) */}
        {activeDs === 'rbtree_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <span style={{ color: '#34d399' }}>✓ Root is BLACK</span>
                <span style={{ color: '#34d399' }}>✓ No Double-Red</span>
                <span style={{ color: '#34d399' }}>✓ Equal Black-Height</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Black Height: 2
              </div>
            </div>

            <svg viewBox="0 0 760 360" style={{ width: '100%', flex: 1, minHeight: '300px' }}>
              <line x1="380" y1="45" x2="240" y2="130" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <line x1="380" y1="45" x2="520" y2="130" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <line x1="240" y1="130" x2="170" y2="220" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <line x1="240" y1="130" x2="310" y2="220" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <line x1="520" y1="130" x2="450" y2="220" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <line x1="520" y1="130" x2="590" y2="220" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />

              {[
                { val: 20, color: 'black', x: 380, y: 45 },
                { val: 10, color: 'black', x: 240, y: 130 },
                { val: 30, color: 'black', x: 520, y: 130 },
                { val: 5, color: 'red', x: 170, y: 220 },
                { val: 15, color: 'red', x: 310, y: 220 },
                { val: 25, color: 'red', x: 450, y: 220 },
                { val: 40, color: 'red', x: 590, y: 220 }
              ].map(n => {
                const isActive = activeRbNode === n.val;
                return (
                  <g key={`rb-${n.val}`}>
                    <circle cx={n.x} cy={n.y} r="24" fill={isActive ? '#f59e0b' : n.color === 'red' ? '#dc2626' : '#0f172a'} stroke={isActive ? '#fbbf24' : n.color === 'red' ? '#f87171' : '#38bdf8'} strokeWidth="3" style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }} />
                    <text x={n.x} y={n.y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">{n.val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* 13. SEGMENT TREE (FULL CANVAS PROPORTIONAL) */}
        {activeDs === 'segment_tree_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>Base Array:</span>
                {segArray.map((v, i) => (
                  <div
                    key={`seg-arr-${i}`}
                    onClick={() => { setIndexInput(String(i)); setInputValue(String(v)); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: indexInput === String(i) ? 'rgba(56,189,248,0.25)' : '#1e293b',
                      border: indexInput === String(i) ? '2px solid #38bdf8' : '1px solid #334155',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <span>{v}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>[{i}]</span>
                  </div>
                ))}
              </div>
              {segQueryResult !== null && (
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                  Result = {segQueryResult}
                </div>
              )}
            </div>

            <svg viewBox="0 0 760 340" style={{ width: '100%', flex: 1, minHeight: '280px' }}>
              {(() => {
                const lines: React.ReactNode[] = [];
                const drawLines = (n?: SegNode) => {
                  if (!n || !n.x || !n.y) return;
                  if (n.left && n.left.x && n.left.y) {
                    lines.push(<line key={`seg-l-${n.id}-${n.left.id}`} x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.left);
                  }
                  if (n.right && n.right.x && n.right.y) {
                    lines.push(<line key={`seg-l-${n.id}-${n.right.id}`} x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />);
                    drawLines(n.right);
                  }
                };
                drawLines(segRoot);
                return lines;
              })()}

              {(() => {
                const circles: React.ReactNode[] = [];
                const drawNodes = (n?: SegNode) => {
                  if (!n || !n.x || !n.y) return;
                  const status = activeSegNodes[n.id];
                  const fill = status === 'contributing' ? '#059669' : status === 'split' ? '#0284c7' : '#1e293b';
                  const stroke = status === 'contributing' ? '#34d399' : status === 'split' ? '#38bdf8' : 'rgba(255,255,255,0.25)';

                  circles.push(
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r="24" fill={fill} stroke={stroke} strokeWidth="3" style={{ filter: status === 'contributing' ? 'drop-shadow(0 0 16px rgba(16,185,129,0.8))' : 'none' }} />
                      <text x={n.x} y={n.y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">{n.val}</text>
                      <text x={n.x} y={n.y + 38} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">[{n.l}, {n.r}]</text>
                    </g>
                  );
                  if (n.left) drawNodes(n.left);
                  if (n.right) drawNodes(n.right);
                };
                drawNodes(segRoot);
                return circles;
              })()}
            </svg>
          </div>
        )}

        {/* 14. TRIE (FULL CANVAS RESPONSIVE EXPANSION) */}
        {activeDs === 'trie_ds' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: '14px', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                  Trie Multi-Way Prefix Hierarchy
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  Green Border = Word End (★)
                </span>
              </div>

              <svg viewBox="0 0 760 420" style={{ width: '100%', flex: 1, minHeight: '340px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                {(() => {
                  const lines: React.ReactNode[] = [];
                  const drawTrieLines = (n: TrieVisualNode) => {
                    if (!n.x || !n.y) return;
                    for (const ch of Object.keys(n.children)) {
                      const child = n.children[ch];
                      if (child.x && child.y) {
                        const isPathActive = trieActivePath.includes(child.id);
                        lines.push(
                          <line
                            key={`trie-l-${n.id}-${child.id}`}
                            x1={n.x}
                            y1={n.y}
                            x2={child.x}
                            y2={child.y}
                            stroke={isPathActive ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
                            strokeWidth={isPathActive ? '3' : '2'}
                          />
                        );
                        drawTrieLines(child);
                      }
                    }
                  };
                  drawTrieLines(trieRoot);
                  return lines;
                })()}

                {(() => {
                  const nodes: React.ReactNode[] = [];
                  const drawTrieNodes = (n: TrieVisualNode) => {
                    if (!n.x || !n.y) return;
                    const isRoot = n.id === 'root';
                    const isPathActive = trieActivePath.includes(n.id);
                    const isTerminal = n.isEnd;

                    nodes.push(
                      <g key={`trie-n-${n.id}`}>
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={isRoot ? 26 : 20}
                          fill={isPathActive ? '#0284c7' : '#0f172a'}
                          stroke={isTerminal ? '#10b981' : isPathActive ? '#38bdf8' : '#64748b'}
                          strokeWidth={isTerminal ? 3 : 2}
                          style={{ filter: isTerminal ? 'drop-shadow(0 0 12px rgba(16,185,129,0.8))' : isPathActive ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'none' }}
                        />
                        <text x={n.x} y={n.y + 5} fill="#ffffff" fontSize={isRoot ? '11' : '12'} fontWeight="bold" textAnchor="middle">
                          {isRoot ? 'ROOT' : n.char.toUpperCase()}
                        </text>
                        {isTerminal && <circle cx={n.x} cy={n.y + 22} r="4" fill="#10b981" />}
                      </g>
                    );

                    for (const ch of Object.keys(n.children)) drawTrieNodes(n.children[ch]);
                  };
                  drawTrieNodes(trieRoot);
                  return nodes;
                })()}
              </svg>

              {autocompleteSuggestions.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '6px 12px', borderRadius: '8px' }}>
                  <strong>Autocomplete:</strong> {autocompleteSuggestions.join(', ')}
                </div>
              )}
            </div>

            {/* Right Side Stored Words Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>Stored Words</span>
                  <span style={{ fontSize: '0.72rem', background: '#1e293b', padding: '2px 8px', borderRadius: '4px', color: '#38bdf8', fontWeight: 700 }}>
                    {trieWords.length}
                  </span>
                </div>
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {trieWords.map((w, idx) => (
                    <div
                      key={`sw-${idx}`}
                      onClick={() => setStrValue(w)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: strValue === w ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                        border: strValue === w ? '1px solid #38bdf8' : '1px solid transparent',
                        color: '#34d399',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>"{w}"</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>★</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>Time Complexity</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '3px' }}>
                  <span>Insert:</span>
                  <strong style={{ color: '#10b981' }}>O(L)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '3px' }}>
                  <span>Search:</span>
                  <strong style={{ color: '#10b981' }}>O(L)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Prefix:</span>
                  <strong style={{ color: '#10b981' }}>O(L)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 15. HEAP (PROPORTIONAL 65% TREE + 35% 1D ARRAY + HEAP SORT BAR) */}
        {activeDs === 'heap_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                <strong>{heapType.toUpperCase()}-HEAP</strong> · Parent = ⌊(i-1)/2⌋ · Left = 2i+1 · Right = 2i+2
              </span>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                Root = {heapArray[0] ?? '—'} · Size = {heapArray.length}
              </span>
            </div>

            {/* Complete Binary Tree View */}
            <svg viewBox="0 0 760 260" style={{ width: '100%', flex: 1, minHeight: '220px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              {heapArray.map((_, idx) => {
                if (idx === 0) return null;
                const parentIdx = Math.floor((idx - 1) / 2);
                const level = Math.floor(Math.log2(idx + 1));
                const posInLevel = idx - (Math.pow(2, level) - 1);
                const countInLevel = Math.pow(2, level);
                const x = (760 / (countInLevel + 1)) * (posInLevel + 1);
                const y = 35 + level * 65;

                const pLevel = Math.floor(Math.log2(parentIdx + 1));
                const pPosInLevel = parentIdx - (Math.pow(2, pLevel) - 1);
                const pCountInLevel = Math.pow(2, pLevel);
                const px = (760 / (pCountInLevel + 1)) * (pPosInLevel + 1);
                const py = 35 + pLevel * 65;

                return <line key={`heap-edge-${idx}`} x1={px} y1={py} x2={x} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />;
              })}

              {heapArray.map((val, idx) => {
                const level = Math.floor(Math.log2(idx + 1));
                const posInLevel = idx - (Math.pow(2, level) - 1);
                const countInLevel = Math.pow(2, level);
                const x = (760 / (countInLevel + 1)) * (posInLevel + 1);
                const y = 35 + level * 65;
                const isActive = activeHeapIndex === idx;

                return (
                  <g key={`heap-node-${idx}`}>
                    <circle cx={x} cy={y} r="22" fill={isActive ? '#f59e0b' : idx === 0 ? '#10b981' : '#1e293b'} stroke={isActive ? '#fbbf24' : '#38bdf8'} strokeWidth="3" style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }} />
                    <text x={x} y={y + 5} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">{val}</text>
                    <text x={x} y={y - 26} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">[{idx}]</text>
                  </g>
                );
              })}
            </svg>

            {/* 1D Array Representation Strip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                1D Contiguous Array Representation (Click to update priority):
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {heapArray.map((val, idx) => {
                  const isActive = activeHeapIndex === idx;
                  return (
                    <div
                      key={`hp-box-${idx}`}
                      onClick={() => { setIndexInput(String(idx)); setInputValue(String(val)); setActiveHeapIndex(idx); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>[{idx}]</span>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        background: isActive ? '#f59e0b' : idx === 0 ? '#10b981' : '#1e293b',
                        border: isActive ? '2px solid #fbbf24' : '1px solid #38bdf8',
                        color: '#fff',
                        fontWeight: 800,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.05rem'
                      }}>
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {heapSortOutput.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(217,119,6,0.15)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(217,119,6,0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800 }}>Heap Sort Output:</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>[ {heapSortOutput.join(', ')} ]</span>
              </div>
            )}
          </div>
        )}

        {/* 16. B-TREE (2-3-4 FULL CANVAS) */}
        {activeDs === 'b_tree_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                <strong>2-3-4 Multi-Way Tree</strong> · 2-Node (1 Key, 2 Ptrs) · 3-Node (2 Keys, 3 Ptrs) · 4-Node (3 Keys, 4 Ptrs)
              </span>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                Keys: [ {bTreeKeys.sort((a, b) => a - b).join(', ')} ]
              </span>
            </div>

            <svg viewBox="0 0 760 380" style={{ width: '100%', flex: 1, minHeight: '320px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              {(() => {
                const lines: React.ReactNode[] = [];
                const draw234Edges = (node: BTree234Node) => {
                  if (!node.x || !node.y) return;
                  node.children.forEach(child => {
                    if (child.x && child.y) {
                      lines.push(
                        <line
                          key={`b234-line-${node.id}-${child.id}`}
                          x1={node.x}
                          y1={node.y}
                          x2={child.x}
                          y2={child.y}
                          stroke="rgba(255,255,255,0.25)"
                          strokeWidth="2.5"
                        />
                      );
                      draw234Edges(child);
                    }
                  });
                };
                draw234Edges(bTreeRoot);
                return lines;
              })()}

              {(() => {
                const nodes: React.ReactNode[] = [];
                const draw234Nodes = (node: BTree234Node) => {
                  if (!node.x || !node.y) return;
                  const count = node.keys.length;
                  const w = count === 1 ? 64 : count === 2 ? 104 : 144;
                  const isActive = activeBTreeNodeId === node.id;

                  nodes.push(
                    <g key={`b234-n-${node.id}`}>
                      <rect
                        x={node.x - w / 2}
                        y={node.y - 18}
                        width={w}
                        height="36"
                        rx="10"
                        fill={isActive ? '#f59e0b' : '#0f172a'}
                        stroke={isActive ? '#fbbf24' : '#38bdf8'}
                        strokeWidth="2.5"
                        style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'none' }}
                      />
                      {node.keys.map((k, idx) => {
                        const segW = w / count;
                        const kx = node.x! - w / 2 + segW * idx + segW / 2;
                        return (
                          <React.Fragment key={`k-${node.id}-${idx}`}>
                            {idx > 0 && (
                              <line
                                x1={node.x! - w / 2 + segW * idx}
                                y1={node.y! - 18}
                                x2={node.x! - w / 2 + segW * idx}
                                y2={node.y! + 18}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1.5"
                              />
                            )}
                            <text x={kx} y={node.y! + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                              {k}
                            </text>
                          </React.Fragment>
                        );
                      })}
                    </g>
                  );
                  node.children.forEach(draw234Nodes);
                };
                draw234Nodes(bTreeRoot);
                return nodes;
              })()}
            </svg>
          </div>
        )}

        {/* 17. DISJOINT SETS (DIRECTED TREE FOREST FULL CANVAS) */}
        {activeDs === 'disjoint_set_ds' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                <strong>Disjoint Sets Forest</strong> (Directed Pointers &uarr; to Parent Root)
              </span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '3px 10px', borderRadius: '4px', fontWeight: 700 }}>
                Distinct Sets: {getDistinctSetsCount()}
              </span>
            </div>

            <svg viewBox="0 0 760 340" style={{ width: '100%', flex: 1, minHeight: '280px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              {dsuParent.map((p, i) => {
                if (p === i) return null;
                const childX = 70 + i * 85;
                const childY = 220;
                const parentX = 70 + p * 85;
                const parentY = 70;
                const isActive = activeDsuNodes.includes(i) || activeDsuNodes.includes(p);

                return (
                  <g key={`dsu-edge-${i}`}>
                    <line
                      x1={childX}
                      y1={childY}
                      x2={parentX}
                      y2={parentY}
                      stroke={isActive ? '#f59e0b' : 'rgba(56,189,248,0.5)'}
                      strokeWidth={isActive ? '3' : '2'}
                      strokeDasharray={isActive ? 'none' : '4 4'}
                    />
                  </g>
                );
              })}

              {dsuParent.map((p, i) => {
                const isRoot = p === i;
                const x = 70 + i * 85;
                const y = isRoot ? 70 : 220;
                const isActive = activeDsuNodes.includes(i);

                return (
                  <g key={`dsu-node-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="24"
                      fill={isActive ? '#f59e0b' : isRoot ? '#059669' : '#1e293b'}
                      stroke={isActive ? '#fbbf24' : isRoot ? '#34d399' : '#38bdf8'}
                      strokeWidth="3"
                      style={{ filter: isActive ? 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' : isRoot ? 'drop-shadow(0 0 10px rgba(16,185,129,0.6))' : 'none' }}
                    />
                    <text x={x} y={y + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {i}
                    </text>
                    <text x={x} y={y + 36} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {isRoot ? `ROOT (R:${dsuRank[i]})` : `p=${p}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Complexity Matrix Modal */}
      {showCheatsheet && (
        <div style={{
          background: '#030712',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'block' }}>
            Data Structures Complexity Matrix (Osmania Core Syllabus)
          </span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '6px 10px' }}>Structure</th>
                <th style={{ padding: '6px 10px' }}>Access</th>
                <th style={{ padding: '6px 10px' }}>Search</th>
                <th style={{ padding: '6px 10px' }}>Insert</th>
                <th style={{ padding: '6px 10px' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Array (Contiguous)', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
                { name: 'String Sequence', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
                { name: 'Singly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1) Head', delete: 'O(1) Head' },
                { name: 'Doubly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1) Head/Tail', delete: 'O(1) Head/Tail' },
                { name: 'Circular Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1) Head/Tail', delete: 'O(1) Head/Tail' },
                { name: 'Stack (LIFO)', access: 'O(n)', search: 'O(n)', insert: 'O(1) Push', delete: 'O(1) Pop' },
                { name: 'Queue (FIFO)', access: 'O(n)', search: 'O(n)', insert: 'O(1) Enqueue', delete: 'O(1) Dequeue' },
                { name: 'Hash Table', access: '—', search: 'O(1) avg', insert: 'O(1) avg', delete: 'O(1) avg' },
                { name: 'Binary Tree (Hierarchy)', access: 'O(n)', search: 'O(n)', insert: 'O(n) Level-order', delete: 'O(n)' },
                { name: 'Binary Search Tree (BST)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
                { name: 'AVL Tree (Self-Balancing)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
                { name: 'Red-Black Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
                { name: 'Segment Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n) Update', delete: '—' },
                { name: 'Trie (Prefix Tree)', access: 'O(L)', search: 'O(L)', insert: 'O(L)', delete: 'O(L)' },
                { name: 'Heap (Priority Q)', access: 'O(1) Root', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)' },
                { name: 'B-Tree (2-3-4)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
                { name: 'Disjoint Sets', access: '—', search: 'O(α(n))', insert: 'O(α(n))', delete: '—' }
              ].map((row, idx) => (
                <tr key={`ds-matrix-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f8fafc' }}>{row.name}</td>
                  <td style={{ padding: '6px 10px', color: row.access.includes('1') ? '#34d399' : '#38bdf8' }}>{row.access}</td>
                  <td style={{ padding: '6px 10px', color: row.search.includes('1') ? '#34d399' : '#38bdf8' }}>{row.search}</td>
                  <td style={{ padding: '6px 10px', color: row.insert.includes('1') ? '#34d399' : '#38bdf8' }}>{row.insert}</td>
                  <td style={{ padding: '6px 10px', color: row.delete.includes('1') ? '#34d399' : '#f87171' }}>{row.delete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
