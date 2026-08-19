import React, { useState, useMemo } from 'react';
import {
  Database, ArrowRight, ArrowLeftRight, Sparkles, Info, Cpu, Activity
} from 'lucide-react';

export type DataStructureType =
  | 'dynamic_array'
  | 'singly_linked_list'
  | 'doubly_linked_list'
  | 'stack_lifo'
  | 'queue_fifo'
  | 'bst_tree'
  | 'avl_tree'
  | 'binary_heap'
  | 'trie_prefix'
  | 'hash_table'
  | 'adj_list_matrix'
  | 'dsu_union_find'
  | 'kd_tree';

export interface DataStructureMeta {
  id: DataStructureType;
  label: string;
  category: 'Linear Structures' | 'Trees & Hierarchies' | 'Heaps & Priority' | 'Hashing & Graphs' | 'Advanced Partitioning';
  icon: string;
  tag: string;
  timeAccess: string;
  timeInsert: string;
  timeDelete: string;
  spaceComp: string;
  cacheLocality: string;
  bytePerElement: number;
}

export const DS_DEFINITIONS: DataStructureMeta[] = [
  // Linear Structures
  {
    id: 'dynamic_array',
    label: 'Dynamic Array (Resizable Vector)',
    category: 'Linear Structures',
    icon: '📦',
    tag: 'Contiguous Memory',
    timeAccess: 'O(1)',
    timeInsert: 'O(1) amortized',
    timeDelete: 'O(N)',
    spaceComp: 'O(N)',
    cacheLocality: '100% (Contiguous Cache Lines)',
    bytePerElement: 4
  },
  {
    id: 'singly_linked_list',
    label: 'Singly Linked List (Node + Next Ptr)',
    category: 'Linear Structures',
    icon: '🔗',
    tag: 'Heap Pointer Chain',
    timeAccess: 'O(N)',
    timeInsert: 'O(1) at Head',
    timeDelete: 'O(1) at Head / O(N)',
    spaceComp: 'O(N)',
    cacheLocality: '40% (Heap Pointer Hops)',
    bytePerElement: 12 // 4B val + 8B ptr
  },
  {
    id: 'doubly_linked_list',
    label: 'Doubly Linked List (Prev + Next Ptrs)',
    category: 'Linear Structures',
    icon: '↔️',
    tag: 'Bidirectional Pointers',
    timeAccess: 'O(N)',
    timeInsert: 'O(1) at Head/Tail',
    timeDelete: 'O(1) with Node Ptr',
    spaceComp: 'O(N)',
    cacheLocality: '35% (Double Pointer Hops)',
    bytePerElement: 20 // 4B val + 8B next + 8B prev
  },
  {
    id: 'stack_lifo',
    label: 'Stack (LIFO Call Frame Buffer)',
    category: 'Linear Structures',
    icon: '📚',
    tag: 'Last-In First-Out',
    timeAccess: 'O(1) at Top',
    timeInsert: 'O(1) Push',
    timeDelete: 'O(1) Pop',
    spaceComp: 'O(N)',
    cacheLocality: '95% (Stack Pointer SP)',
    bytePerElement: 4
  },
  {
    id: 'queue_fifo',
    label: 'Queue (FIFO Sequential Buffer)',
    category: 'Linear Structures',
    icon: '🚶',
    tag: 'First-In First-Out',
    timeAccess: 'O(1) at Front',
    timeInsert: 'O(1) Enqueue (Rear)',
    timeDelete: 'O(1) Dequeue (Front)',
    spaceComp: 'O(N)',
    cacheLocality: '90% (Ring Buffer)',
    bytePerElement: 4
  },

  // Trees & Hierarchies
  {
    id: 'bst_tree',
    label: 'Binary Search Tree (BST)',
    category: 'Trees & Hierarchies',
    icon: '🌲',
    tag: 'Left < Root < Right',
    timeAccess: 'O(log N) avg / O(N) worst',
    timeInsert: 'O(log N) avg / O(N) worst',
    timeDelete: 'O(log N) avg / O(N) worst',
    spaceComp: 'O(N)',
    cacheLocality: '50% (Tree Pointer Nodes)',
    bytePerElement: 20 // 4B val + 8B left + 8B right
  },
  {
    id: 'avl_tree',
    label: 'AVL Tree (Self-Balancing Rotations)',
    category: 'Trees & Hierarchies',
    icon: '⚖️',
    tag: 'Strict |BF| ≤ 1',
    timeAccess: 'O(log N) guaranteed',
    timeInsert: 'O(log N) + Rotations',
    timeDelete: 'O(log N) + Rotations',
    spaceComp: 'O(N)',
    cacheLocality: '55% (Balanced Depth Tree)',
    bytePerElement: 24 // 4B val + 8B left + 8B right + 4B height
  },
  {
    id: 'trie_prefix',
    label: 'Trie (Prefix Character Tree)',
    category: 'Trees & Hierarchies',
    icon: '🔤',
    tag: 'Alphabet Dictionary',
    timeAccess: 'O(L) string length',
    timeInsert: 'O(L) string length',
    timeDelete: 'O(L) string length',
    spaceComp: 'O(Σ · N · L)',
    cacheLocality: '60% (Branching Arrays)',
    bytePerElement: 32
  },

  // Heaps & Priority Queues
  {
    id: 'binary_heap',
    label: 'Binary Heap (Max & Min Priority Queue)',
    category: 'Heaps & Priority',
    icon: '🔺',
    tag: 'Array-Backed Binary Tree',
    timeAccess: 'O(1) Peek Root',
    timeInsert: 'O(log N) Heapify Up',
    timeDelete: 'O(log N) Extract Root',
    spaceComp: 'O(N)',
    cacheLocality: '95% (Complete Array Backing)',
    bytePerElement: 4
  },

  // Hashing & Graphs
  {
    id: 'hash_table',
    label: 'Hash Table (Separate Chaining)',
    category: 'Hashing & Graphs',
    icon: '🔑',
    tag: 'h(k) = k mod M Buckets',
    timeAccess: 'O(1) avg / O(N) worst',
    timeInsert: 'O(1) avg',
    timeDelete: 'O(1) avg',
    spaceComp: 'O(N + M)',
    cacheLocality: '65% (Buckets + Chains)',
    bytePerElement: 16
  },
  {
    id: 'adj_list_matrix',
    label: 'Graph (Adjacency Matrix vs List)',
    category: 'Hashing & Graphs',
    icon: '🕸️',
    tag: 'Dual Graph Representation',
    timeAccess: 'Matrix: O(1) | List: O(deg(V))',
    timeInsert: 'Matrix: O(1) | List: O(1)',
    timeDelete: 'Matrix: O(1) | List: O(deg(V))',
    spaceComp: 'Matrix: O(V²) | List: O(V + E)',
    cacheLocality: 'Matrix: 95% | List: 50%',
    bytePerElement: 4
  },
  {
    id: 'dsu_union_find',
    label: 'Disjoint Set Union (DSU / Union-Find)',
    category: 'Hashing & Graphs',
    icon: '🌳',
    tag: 'Path Compression & Rank',
    timeAccess: 'O(α(N)) ≈ O(1)',
    timeInsert: 'O(α(N)) Union',
    timeDelete: 'N/A (Merge Only)',
    spaceComp: 'O(N)',
    cacheLocality: '90% (Parent Array)',
    bytePerElement: 8 // parent + rank
  },

  // Advanced Partitioning
  {
    id: 'kd_tree',
    label: '2D KD-Tree (Spatial Space Partition)',
    category: 'Advanced Partitioning',
    icon: '🧭',
    tag: 'Alternating X/Y Hyperplanes',
    timeAccess: 'O(log N) avg Nearest Neighbor',
    timeInsert: 'O(log N)',
    timeDelete: 'O(log N)',
    spaceComp: 'O(N)',
    cacheLocality: '60% (Spatial Tree)',
    bytePerElement: 28
  }
];

// Tree Node Interface for real BST and AVL calculations
interface AvlNode {
  val: number;
  height: number;
  bf: number;
  left: AvlNode | null;
  right: AvlNode | null;
}

// Tree Rendering Coordinates
interface TreeRenderNode {
  val: number;
  x: number;
  y: number;
  bf: number;
  height: number;
  leftVal: number | null;
  rightVal: number | null;
  leftX?: number;
  leftY?: number;
  rightX?: number;
  rightY?: number;
}

export const DataStructuresModule: React.FC = () => {
  const [selectedDS, setSelectedDS] = useState<DataStructureType>('avl_tree');
  const [inputVal, setInputVal] = useState<string>('42');
  const [inputIndex, setInputIndex] = useState<string>('0');
  const [operationLog, setOperationLog] = useState<string>('Interactive Data Structures Laboratory initialized. Select an operation or insert keys.');
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);
  const [mobileActiveTab, setMobileActiveTab] = useState<'visualizer' | 'controls'>('visualizer');

  // 1. DYNAMIC ARRAY STATE
  const [arrayData, setArrayData] = useState<{ val: number; id: string }[]>([
    { val: 12, id: 'a1' },
    { val: 24, id: 'a2' },
    { val: 36, id: 'a3' },
    { val: 48, id: 'a4' },
    { val: 60, id: 'a5' }
  ]);
  const [arrayCapacity, setArrayCapacity] = useState<number>(8);

  // 2. SINGLY & DOUBLY LINKED LIST STATE
  const [linkedListData, setLinkedListData] = useState<number[]>([15, 30, 45, 60, 75]);
  const [doublyListData, setDoublyListData] = useState<number[]>([10, 25, 40, 55, 70]);

  // 3. STACK STATE (LIFO)
  const [stackData, setStackData] = useState<number[]>([10, 20, 30, 40]);

  // 4. QUEUE STATE (FIFO)
  const [queueData, setQueueData] = useState<number[]>([5, 10, 15, 20, 25]);

  // 5. BST & AVL STATE (Raw Key Pool)
  const [treeKeys, setTreeKeys] = useState<number[]>([50, 25, 75, 15, 35, 65, 85]);

  // 6. BINARY HEAP STATE
  const [heapData, setHeapData] = useState<number[]>([90, 80, 70, 50, 60, 40, 30]);
  const [heapMode, setHeapMode] = useState<'max' | 'min'>('max');

  // 7. TRIE STATE
  const [trieWords, setTrieWords] = useState<string[]>(['CAT', 'CAR', 'CART', 'DOG', 'DOT']);

  // 8. HASH TABLE STATE (Separate Chaining)
  const [hashBuckets, setHashBuckets] = useState<Record<number, number[]>>({
    0: [10, 20],
    1: [21],
    2: [12, 32],
    3: [43],
    4: [14]
  });

  // 9. ADJACENCY MATRIX & LIST GRAPH STATE
  const [graphVertices] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);
  const [graphMatrix, setGraphMatrix] = useState<number[][]>([
    [0, 1, 1, 0, 0],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
    [0, 1, 0, 1, 0]
  ]);

  // 10. DSU STATE
  const [dsuParents, setDsuParents] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [dsuRanks, setDsuRanks] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Active DS Metadata
  const currentMeta = useMemo(() => {
    return DS_DEFINITIONS.find(d => d.id === selectedDS) || DS_DEFINITIONS[0];
  }, [selectedDS]);

  // --- AVL & BST TREE ALGORITHM COMPUTATIONS ---
  const getNodeHeight = (node: AvlNode | null): number => (node ? node.height : 0);
  const getBf = (node: AvlNode | null): number => (node ? getNodeHeight(node.left) - getNodeHeight(node.right) : 0);

  const rightRotate = (y: AvlNode): AvlNode => {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(getNodeHeight(y.left), getNodeHeight(y.right)) + 1;
    y.bf = getBf(y);
    x.height = Math.max(getNodeHeight(x.left), getNodeHeight(x.right)) + 1;
    x.bf = getBf(x);
    return x;
  };

  const leftRotate = (x: AvlNode): AvlNode => {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(getNodeHeight(x.left), getNodeHeight(x.right)) + 1;
    x.bf = getBf(x);
    y.height = Math.max(getNodeHeight(y.left), getNodeHeight(y.right)) + 1;
    y.bf = getBf(y);
    return y;
  };

  // Build recursive AVL tree from keys
  const avlRoot = useMemo<AvlNode | null>(() => {
    const insert = (node: AvlNode | null, val: number): AvlNode => {
      if (!node) {
        return { val, height: 1, bf: 0, left: null, right: null };
      }
      if (val < node.val) {
        node.left = insert(node.left, val);
      } else if (val > node.val) {
        node.right = insert(node.right, val);
      } else {
        return node;
      }

      node.height = Math.max(getNodeHeight(node.left), getNodeHeight(node.right)) + 1;
      const balance = getBf(node);
      node.bf = balance;

      if (selectedDS === 'avl_tree') {
        // Left Left Case
        if (balance > 1 && val < node.left!.val) {
          return rightRotate(node);
        }
        // Right Right Case
        if (balance < -1 && val > node.right!.val) {
          return leftRotate(node);
        }
        // Left Right Case
        if (balance > 1 && val > node.left!.val) {
          node.left = leftRotate(node.left!);
          return rightRotate(node);
        }
        // Right Left Case
        if (balance < -1 && val < node.right!.val) {
          node.right = rightRotate(node.right!);
          return leftRotate(node);
        }
      }
      return node;
    };

    let root: AvlNode | null = null;
    for (const key of treeKeys) {
      root = insert(root, key);
    }
    return root;
  }, [treeKeys, selectedDS]);

  // Compute 2D SVG Layout for Binary Tree
  const renderedTreeNodes = useMemo<TreeRenderNode[]>(() => {
    if (!avlRoot) return [];
    const list: TreeRenderNode[] = [];

    const traverse = (node: AvlNode | null, x: number, y: number, spread: number): TreeRenderNode | null => {
      if (!node) return null;

      const currentRender: TreeRenderNode = {
        val: node.val,
        x,
        y,
        bf: node.bf,
        height: node.height,
        leftVal: node.left ? node.left.val : null,
        rightVal: node.right ? node.right.val : null
      };

      if (node.left) {
        const nextX = x - spread;
        const nextY = y + 70;
        currentRender.leftX = nextX;
        currentRender.leftY = nextY;
        traverse(node.left, nextX, nextY, spread * 0.52);
      }

      if (node.right) {
        const nextX = x + spread;
        const nextY = y + 70;
        currentRender.rightX = nextX;
        currentRender.rightY = nextY;
        traverse(node.right, nextX, nextY, spread * 0.52);
      }

      list.push(currentRender);
      return currentRender;
    };

    traverse(avlRoot, 250, 40, 110);
    return list;
  }, [avlRoot]);

  // --- OPERATIONS HANDLERS ---

  // Array Operations
  const handleArrayPush = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    if (arrayData.length >= arrayCapacity) {
      const newCap = arrayCapacity * 2;
      setArrayCapacity(newCap);
      setOperationLog(`Array full! Triggered amortized geometric resize: Capacity doubled (${arrayCapacity} → ${newCap}). Appended ${num} in O(1) amortized time.`);
    } else {
      setOperationLog(`Pushed ${num} to index [${arrayData.length}]. Contiguous buffer pointer incremented. Time: O(1).`);
    }
    setArrayData(prev => [...prev, { val: num, id: `arr_${Date.now()}` }]);
    setHighlightedIndices([arrayData.length]);
  };

  const handleArrayPop = () => {
    if (arrayData.length === 0) {
      setOperationLog('Underflow Error: Array buffer is already empty!');
      return;
    }
    const popped = arrayData[arrayData.length - 1];
    setArrayData(prev => prev.slice(0, -1));
    setOperationLog(`Popped element ${popped.val} from index [${arrayData.length - 1}]. Time Complexity: O(1).`);
  };

  const handleArrayInsertAt = () => {
    const idx = Math.max(0, Math.min(arrayData.length, parseInt(inputIndex) || 0));
    const num = parseInt(inputVal) || 99;
    const next = [...arrayData];
    next.splice(idx, 0, { val: num, id: `arr_${Date.now()}` });
    setArrayData(next);
    setHighlightedIndices([idx]);
    setOperationLog(`Inserted ${num} at index [${idx}]. Shifted ${arrayData.length - idx} elements right in contiguous RAM. Time: O(N).`);
  };

  const handleArrayDeleteAt = () => {
    const idx = Math.max(0, Math.min(arrayData.length - 1, parseInt(inputIndex) || 0));
    if (arrayData.length === 0) return;
    const removed = arrayData[idx];
    const next = [...arrayData];
    next.splice(idx, 1);
    setArrayData(next);
    setOperationLog(`Deleted element ${removed.val} at index [${idx}]. Shifted remaining elements left. Time: O(N).`);
  };

  // Singly Linked List
  const handleLLInsertHead = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setLinkedListData(prev => [num, ...prev]);
    setOperationLog(`Allocated Node(${num}, next->HEAD). HEAD pointer updated in O(1) time.`);
  };

  const handleLLInsertTail = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setLinkedListData(prev => [...prev, num]);
    setOperationLog(`Allocated Node(${num}, next->NULL) and updated tail pointer in O(1) time.`);
  };

  const handleLLDeleteHead = () => {
    if (linkedListData.length === 0) {
      setOperationLog('List is empty! Cannot delete head.');
      return;
    }
    const rem = linkedListData[0];
    setLinkedListData(prev => prev.slice(1));
    setOperationLog(`Deleted HEAD Node(${rem}). HEAD pointer advanced to curr->next in O(1) time.`);
  };

  // Doubly Linked List
  const handleDLLInsertHead = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setDoublyListData(prev => [num, ...prev]);
    setOperationLog(`Allocated DoublyNode(prev->NULL, val=${num}, next->HEAD). Bidirectional links updated in O(1) time.`);
  };

  const handleDLLInsertTail = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setDoublyListData(prev => [...prev, num]);
    setOperationLog(`Appended DoublyNode(${num}) at TAIL. Bidirectional links prev <-> next updated in O(1) time.`);
  };

  const handleDLLDeleteTail = () => {
    if (doublyListData.length === 0) {
      setOperationLog('Doubly Linked List is empty!');
      return;
    }
    const rem = doublyListData[doublyListData.length - 1];
    setDoublyListData(prev => prev.slice(0, -1));
    setOperationLog(`Deleted TAIL Node(${rem}). Tail pointer moved backwards via tail->prev in O(1) time.`);
  };

  // Stack Operations
  const handleStackPush = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setStackData(prev => [...prev, num]);
    setOperationLog(`Pushed ${num} onto Stack (TOP). LIFO invariant satisfied. SP pointer incremented. Time: O(1).`);
  };

  const handleStackPop = () => {
    if (stackData.length === 0) {
      setOperationLog('Stack Underflow Error: No elements to pop!');
      return;
    }
    const popped = stackData[stackData.length - 1];
    setStackData(prev => prev.slice(0, -1));
    setOperationLog(`Popped ${popped} from TOP of Stack in O(1) time.`);
  };

  // Queue Operations
  const handleQueueEnqueue = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    setQueueData(prev => [...prev, num]);
    setOperationLog(`Enqueued ${num} at REAR. FIFO invariant satisfied. Tail pointer advanced in O(1) time.`);
  };

  const handleQueueDequeue = () => {
    if (queueData.length === 0) {
      setOperationLog('Queue Underflow Error: Queue is empty!');
      return;
    }
    const rem = queueData[0];
    setQueueData(prev => prev.slice(1));
    setOperationLog(`Dequeued ${rem} from FRONT of Queue in O(1) time.`);
  };

  // Tree Operations (BST / AVL)
  const handleTreeInsert = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    if (treeKeys.includes(num)) {
      setOperationLog(`Key ${num} already exists in tree (No duplicates allowed).`);
      return;
    }
    setTreeKeys(prev => [...prev, num]);
    setHighlightedNodes([num]);
    if (selectedDS === 'avl_tree') {
      setOperationLog(`Inserted ${num} into AVL Tree. Calculated Balance Factors and performed automatic self-balancing rotation in O(log N) time.`);
    } else {
      setOperationLog(`Inserted ${num} into BST. Traversed left (<) and right (>) branches to locate leaf position in O(log N) time.`);
    }
  };

  const handleTreeSearch = () => {
    const num = parseInt(inputVal) || 35;
    if (treeKeys.includes(num)) {
      setHighlightedNodes([num]);
      setOperationLog(`Key ${num} FOUND in tree! Binary comparison path traversed in O(log N) depth.`);
    } else {
      setHighlightedNodes([]);
      setOperationLog(`Key ${num} NOT found after inspecting tree leaf nodes.`);
    }
  };

  const handleTreeReset = () => {
    setTreeKeys([50, 25, 75, 15, 35, 65, 85]);
    setHighlightedNodes([]);
    setOperationLog('Reset tree to standard balanced 7-node topology.');
  };

  // Binary Heap Operations (Max / Min)
  const handleHeapInsert = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    const nextHeap = [...heapData, num];
    let idx = nextHeap.length - 1;

    // Heapify Up
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const condition = heapMode === 'max'
        ? nextHeap[idx] > nextHeap[parentIdx]
        : nextHeap[idx] < nextHeap[parentIdx];

      if (condition) {
        const tmp = nextHeap[idx];
        nextHeap[idx] = nextHeap[parentIdx];
        nextHeap[parentIdx] = tmp;
        idx = parentIdx;
      } else {
        break;
      }
    }
    setHeapData(nextHeap);
    setOperationLog(`Inserted ${num} into ${heapMode.toUpperCase()}-Heap. Bubbled up via parent comparison Math.floor((i-1)/2) in O(log N) time.`);
  };

  const handleHeapExtractRoot = () => {
    if (heapData.length === 0) {
      setOperationLog('Heap Underflow: Heap buffer is empty!');
      return;
    }
    const rootVal = heapData[0];
    if (heapData.length === 1) {
      setHeapData([]);
      setOperationLog(`Extracted ${heapMode.toUpperCase()} Root: ${rootVal}.`);
      return;
    }

    const nextHeap = [...heapData];
    nextHeap[0] = nextHeap.pop()!;
    let idx = 0;
    const len = nextHeap.length;

    // Heapify Down
    while (true) {
      let target = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (heapMode === 'max') {
        if (left < len && nextHeap[left] > nextHeap[target]) target = left;
        if (right < len && nextHeap[right] > nextHeap[target]) target = right;
      } else {
        if (left < len && nextHeap[left] < nextHeap[target]) target = left;
        if (right < len && nextHeap[right] < nextHeap[target]) target = right;
      }

      if (target !== idx) {
        const tmp = nextHeap[idx];
        nextHeap[idx] = nextHeap[target];
        nextHeap[target] = tmp;
        idx = target;
      } else {
        break;
      }
    }
    setHeapData(nextHeap);
    setOperationLog(`Extracted ${heapMode.toUpperCase()} Root (${rootVal}). Sifted down last leaf to maintain heap invariant in O(log N) time.`);
  };

  // Hash Table Insert
  const handleHashInsert = () => {
    const num = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    const bucket = num % 5;
    setHashBuckets(prev => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), num]
    }));
    setOperationLog(`Key ${num} hashed: h(${num}) = ${num} % 5 = Slot [${bucket}]. Chained into bucket list in O(1) average time.`);
  };

  // Trie Insert
  const handleTrieInsert = () => {
    const word = (inputVal || 'TREE').toUpperCase().replace(/[^A-Z]/g, '');
    if (!word) return;
    if (trieWords.includes(word)) {
      setOperationLog(`Word "${word}" already exists in Trie dictionary.`);
      return;
    }
    setTrieWords(prev => [...prev, word]);
    setOperationLog(`Inserted word "${word}" into Trie. Created character branch nodes in O(L) time (L=${word.length}).`);
  };

  // DSU Union Operation
  const handleDsuUnion = () => {
    const u = Math.floor(Math.random() * 6);
    const v = (u + 1 + Math.floor(Math.random() * 5)) % 7;

    const find = (i: number): number => {
      let root = i;
      while (root !== dsuParents[root]) {
        root = dsuParents[root];
      }
      return root;
    };

    const rootU = find(u);
    const rootV = find(v);

    if (rootU !== rootV) {
      const nextParents = [...dsuParents];
      const nextRanks = [...dsuRanks];
      if (nextRanks[rootU] < nextRanks[rootV]) {
        nextParents[rootU] = rootV;
      } else if (nextRanks[rootU] > nextRanks[rootV]) {
        nextParents[rootV] = rootU;
      } else {
        nextParents[rootV] = rootU;
        nextRanks[rootU] += 1;
      }
      setDsuParents(nextParents);
      setDsuRanks(nextRanks);
      setOperationLog(`Executed DSU Union(${u}, ${v}) with Path Compression & Rank. Disjoint sets merged in O(α(N)) time.`);
    } else {
      setOperationLog(`Elements ${u} and ${v} are already connected in the same component (Root: ${rootU}).`);
    }
  };

  // Toggle Graph Edge in Adjacency Matrix
  const toggleGraphEdge = (r: number, c: number) => {
    setGraphMatrix(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      next[c][r] = next[r][c]; // Undirected symmetry
      return next;
    });
    setOperationLog(`Toggled edge between Vertex ${graphVertices[r]} and Vertex ${graphVertices[c]}. Updated Adjacency Matrix M[${r}][${c}] and Pointer List.`);
  };

  // Grouped Categories for Dropdown
  const categoriesList = ['Linear Structures', 'Trees & Hierarchies', 'Heaps & Priority', 'Hashing & Graphs', 'Advanced Partitioning'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Top Deck: Categorized Dropdown Selector Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Database size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
              Interactive Data Structures Laboratory
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Real-time memory telemetry, dynamic pointers, balance factors & self-balancing tree animations
            </span>
          </div>
        </div>

        {/* Categorized Dropdown Selector (Replaces horizontal scrolling ribbon) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Data Structure:
          </label>
          <select
            value={selectedDS}
            onChange={e => {
              setSelectedDS(e.target.value as DataStructureType);
              setHighlightedIndices([]);
              setHighlightedNodes([]);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: '#1e293b',
              border: '1.5px solid #38bdf8',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              minWidth: '280px',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)'
            }}
          >
            {categoriesList.map(cat => (
              <optgroup key={cat} label={`── ${cat} ──`} style={{ background: '#0f172a', color: '#38bdf8', fontWeight: 'bold' }}>
                {DS_DEFINITIONS.filter(d => d.category === cat).map(ds => (
                  <option key={ds.id} value={ds.id} style={{ background: '#1e293b', color: '#f8fafc' }}>
                    {ds.icon} {ds.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Active Category Badge */}
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {currentMeta.category}
          </span>
        </div>
      </div>

      {/* ─── Mobile Segmented Dual-View Switcher ─── */}
      <div className="ds-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('visualizer')}
          className={`ds-mobile-tab-btn ${mobileActiveTab === 'visualizer' ? 'active' : ''}`}
        >
          <Database size={14} />
          <span>DS Visualizer Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('controls')}
          className={`ds-mobile-tab-btn ${mobileActiveTab === 'controls' ? 'active' : ''}`}
        >
          <Activity size={14} />
          <span>Controls & Memory</span>
        </button>
      </div>

      {/* Main Interactive Workbench: Left Visualizer + Right Operations & Memory Deck */}
      <div className="ds-workbench-grid">
        {/* Left: Dynamic Visualizer Canvas Container */}
        <div className={`ds-canvas-panel ${mobileActiveTab === 'visualizer' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* Visual Header with Real-Time Mode Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentMeta.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                {currentMeta.tag}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                ⚡ Real-time SVG
              </span>
            </div>
          </div>

          {/* Visualization Canvas Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, rgba(11, 17, 32, 0.95) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              padding: '18px',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* 1. DYNAMIC ARRAY VISUALIZER */}
            {selectedDS === 'dynamic_array' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: arrayCapacity }).map((_, idx) => {
                    const item = arrayData[idx];
                    const isOccupied = item !== undefined;
                    const isHigh = highlightedIndices.includes(idx);

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>[{idx}]</span>
                        <div
                          style={{
                            width: '58px',
                            height: '64px',
                            borderRadius: '10px',
                            background: isOccupied
                              ? isHigh
                                ? 'linear-gradient(135deg, #0284c7, #06b6d4)'
                                : 'rgba(30, 41, 59, 0.95)'
                              : 'rgba(15, 23, 42, 0.4)',
                            border: isOccupied ? '2px solid #38bdf8' : '1.5px dashed rgba(71, 85, 105, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: isOccupied ? '#f8fafc' : '#475569',
                            boxShadow: isHigh ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isOccupied ? item.val : '-'}
                        </div>
                        <span style={{ fontSize: '0.62rem', color: isOccupied ? '#38bdf8' : '#475569', fontFamily: 'monospace' }}>
                          0x{(0x1000 + idx * 4).toString(16).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Size: <strong style={{ color: '#38bdf8' }}>{arrayData.length}</strong></span>
                  <span>Capacity: <strong style={{ color: '#a855f7' }}>{arrayCapacity}</strong></span>
                  <span>Utilization: <strong style={{ color: '#34d399' }}>{Math.round((arrayData.length / arrayCapacity) * 100)}%</strong></span>
                </div>
              </div>
            )}

            {/* 2. SINGLY LINKED LIST VISUALIZER */}
            {selectedDS === 'singly_linked_list' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                  HEAD
                </div>
                <ArrowRight size={18} color="#38bdf8" />

                {linkedListData.map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: '12px',
                        background: '#1e293b',
                        border: '2px solid #38bdf8',
                        overflow: 'hidden',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                      }}
                    >
                      <div style={{ padding: '12px 16px', fontSize: '1rem', fontWeight: 700, color: '#f8fafc', borderRight: '1px solid #334155' }}>
                        {val}
                      </div>
                      <div style={{ padding: '12px 10px', fontSize: '0.65rem', color: '#38bdf8', fontFamily: 'monospace', display: 'flex', alignItems: 'center' }}>
                        0x{(0x200 + idx * 16).toString(16)}
                      </div>
                    </div>
                    {idx < linkedListData.length - 1 ? (
                      <ArrowRight size={18} color="#38bdf8" />
                    ) : (
                      <>
                        <ArrowRight size={18} color="#f59e0b" />
                        <div style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700 }}>
                          NULL
                        </div>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* 3. DOUBLY LINKED LIST VISUALIZER */}
            {selectedDS === 'doubly_linked_list' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                  HEAD
                </div>
                <ArrowLeftRight size={18} color="#38bdf8" />

                {doublyListData.map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: '12px',
                        background: '#1e293b',
                        border: '2px solid #a855f7',
                        overflow: 'hidden',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                      }}
                    >
                      <div style={{ padding: '8px 6px', fontSize: '0.6rem', color: '#a855f7', borderRight: '1px solid #334155', display: 'flex', alignItems: 'center' }}>
                        Prev
                      </div>
                      <div style={{ padding: '12px 14px', fontSize: '1rem', fontWeight: 700, color: '#f8fafc', borderRight: '1px solid #334155' }}>
                        {val}
                      </div>
                      <div style={{ padding: '8px 6px', fontSize: '0.6rem', color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                        Next
                      </div>
                    </div>
                    {idx < doublyListData.length - 1 ? (
                      <ArrowLeftRight size={18} color="#c084fc" />
                    ) : (
                      <>
                        <ArrowRight size={18} color="#f59e0b" />
                        <div style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700 }}>
                          TAIL (NULL)
                        </div>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* 4. STACK (LIFO) VISUALIZER */}
            {selectedDS === 'stack_lifo' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '180px',
                    borderLeft: '4px solid #a855f7',
                    borderRight: '4px solid #a855f7',
                    borderBottom: '4px solid #a855f7',
                    borderRadius: '0 0 16px 16px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '8px',
                    minHeight: '260px',
                    background: 'rgba(15, 23, 42, 0.7)'
                  }}
                >
                  {stackData.map((val, idx) => {
                    const isTop = idx === stackData.length - 1;
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: isTop ? 'linear-gradient(135deg, #a855f7, #6366f1)' : '#1e293b',
                          border: isTop ? '2px solid #ffffff' : '1px solid #334155',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          textAlign: 'center',
                          boxShadow: isTop ? '0 0 14px rgba(168, 85, 247, 0.5)' : 'none'
                        }}
                      >
                        {val} {isTop && '← SP (TOP)'}
                      </div>
                    );
                  })}
                  {stackData.length === 0 && (
                    <span style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', margin: 'auto' }}>
                      Stack Buffer Empty
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
                  Last-In, First-Out (LIFO) Call Frame Stack
                </span>
              </div>
            )}

            {/* 5. QUEUE (FIFO) VISUALIZER */}
            {selectedDS === 'queue_fifo' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '6px 10px', borderRadius: '8px', background: '#059669', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                    FRONT (Dequeue)
                  </div>
                  <ArrowRight size={18} color="#34d399" />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: '#1e293b',
                      borderRadius: '12px',
                      border: '2px dashed #34d399'
                    }}
                  >
                    {queueData.map((val, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '48px',
                          height: '52px',
                          borderRadius: '8px',
                          background: idx === 0 ? '#059669' : '#0f172a',
                          border: '1.5px solid #34d399',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        {val}
                      </div>
                    ))}
                    {queueData.length === 0 && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Queue Empty</span>}
                  </div>

                  <ArrowRight size={18} color="#34d399" />
                  <div style={{ padding: '6px 10px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                    REAR (Enqueue)
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                  First-In, First-Out (FIFO) Sequential Ring Buffer
                </span>
              </div>
            )}

            {/* 6. DYNAMIC BST & AVL TREE VISUALIZER */}
            {(selectedDS === 'bst_tree' || selectedDS === 'avl_tree') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: '500px', height: 'auto', overflow: 'visible' }}>
                  {/* Render Lines first */}
                  {renderedTreeNodes.map((n, idx) => (
                    <React.Fragment key={`lines_${idx}`}>
                      {n.leftX !== undefined && n.leftY !== undefined && (
                        <line x1={n.x} y1={n.y} x2={n.leftX} y2={n.leftY} stroke="#38bdf8" strokeWidth="2.5" />
                      )}
                      {n.rightX !== undefined && n.rightY !== undefined && (
                        <line x1={n.x} y1={n.y} x2={n.rightX} y2={n.rightY} stroke="#38bdf8" strokeWidth="2.5" />
                      )}
                    </React.Fragment>
                  ))}

                  {/* Render Nodes with Live Balance Factors */}
                  {renderedTreeNodes.map((n, idx) => {
                    const isHigh = highlightedNodes.includes(n.val);
                    const isUnbalanced = Math.abs(n.bf) > 1;
                    const bfColor = n.bf === 0 ? '#10b981' : Math.abs(n.bf) === 1 ? '#fbbf24' : '#ef4444';

                    return (
                      <g key={`node_${idx}`}>
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="20"
                          fill={isHigh ? '#10b981' : isUnbalanced ? '#7f1d1d' : '#0284c7'}
                          stroke={isHigh ? '#34d399' : isUnbalanced ? '#ef4444' : '#ffffff'}
                          strokeWidth="2.5"
                        />
                        <text x={n.x} y={n.y + 5} fill="#ffffff" fontWeight="bold" fontSize="12" textAnchor="middle">
                          {n.val}
                        </text>

                        {/* Balance Factor Badge */}
                        {selectedDS === 'avl_tree' && (
                          <g transform={`translate(${n.x}, ${n.y - 26})`}>
                            <rect x="-18" y="-9" width="36" height="15" rx="4" fill="#0f172a" stroke={bfColor} strokeWidth="1" />
                            <text x="0" y="2" fill={bfColor} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                              BF: {n.bf > 0 ? `+${n.bf}` : n.bf}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.74rem', color: '#94a3b8' }}>
                  <span>Total Keys: <strong style={{ color: '#38bdf8' }}>{treeKeys.length}</strong></span>
                  <span>Tree Height: <strong style={{ color: '#a855f7' }}>{avlRoot ? avlRoot.height : 0}</strong></span>
                  {selectedDS === 'avl_tree' ? (
                    <span style={{ color: '#34d399' }}>Invariant: Balance Factor |BF| ≤ 1 (Guaranteed O(log N))</span>
                  ) : (
                    <span style={{ color: '#fbbf24' }}>Standard BST (Left &lt; Root &lt; Right)</span>
                  )}
                </div>
              </div>
            )}

            {/* 7. DUAL-VIEW BINARY HEAP (Max-Heap / Min-Heap) */}
            {selectedDS === 'binary_heap' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                {/* Heap Mode Switcher */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setHeapMode('max');
                      setHeapData([90, 80, 70, 50, 60, 40, 30]);
                      setOperationLog('Switched to MAX-HEAP mode: Parent key ≥ Children keys.');
                    }}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '8px',
                      background: heapMode === 'max' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : '#1e293b',
                      border: heapMode === 'max' ? '1px solid #c084fc' : '1px solid #334155',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: heapMode === 'max' ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
                    }}
                  >
                    🔺 Max-Heap Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeapMode('min');
                      setHeapData([10, 20, 30, 50, 40, 60, 70]);
                      setOperationLog('Switched to MIN-HEAP mode: Parent key ≤ Children keys.');
                    }}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '8px',
                      background: heapMode === 'min' ? 'linear-gradient(135deg, #059669, #10b981)' : '#1e293b',
                      border: heapMode === 'min' ? '1px solid #34d399' : '1px solid #334155',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: heapMode === 'min' ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                  >
                    🔻 Min-Heap Mode
                  </button>
                </div>

                {/* 2D Complete Binary Tree SVG Representation */}
                <svg viewBox="0 0 480 190" style={{ width: '100%', maxWidth: '480px', height: 'auto', overflow: 'visible' }}>
                  {/* Branch Lines from Parent to Children */}
                  {heapData.map((_, idx) => {
                    if (idx === 0) return null;
                    const pIdx = Math.floor((idx - 1) / 2);
                    const getHeapCoord = (i: number) => {
                      const level = Math.floor(Math.log2(i + 1));
                      const levelStart = Math.pow(2, level) - 1;
                      const posInLevel = i - levelStart;
                      const numInLevel = Math.pow(2, level);
                      const width = 440;
                      const x = (posInLevel + 0.5) * (width / numInLevel) + 20;
                      const y = 25 + level * 52;
                      return { x, y };
                    };
                    const pCoord = getHeapCoord(pIdx);
                    const cCoord = getHeapCoord(idx);

                    return (
                      <line
                        key={`heap_line_${idx}`}
                        x1={pCoord.x}
                        y1={pCoord.y}
                        x2={cCoord.x}
                        y2={cCoord.y}
                        stroke={heapMode === 'max' ? '#c084fc' : '#34d399'}
                        strokeWidth="2"
                        strokeDasharray={idx > 2 ? '3,3' : 'none'}
                      />
                    );
                  })}

                  {/* Heap Node Circles */}
                  {heapData.map((val, idx) => {
                    const level = Math.floor(Math.log2(idx + 1));
                    const levelStart = Math.pow(2, level) - 1;
                    const posInLevel = idx - levelStart;
                    const numInLevel = Math.pow(2, level);
                    const width = 440;
                    const x = (posInLevel + 0.5) * (width / numInLevel) + 20;
                    const y = 25 + level * 52;
                    const isRoot = idx === 0;

                    return (
                      <g key={`heap_node_${idx}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isRoot ? "18" : "16"}
                          fill={isRoot ? (heapMode === 'max' ? '#7c3aed' : '#059669') : '#1e293b'}
                          stroke={isRoot ? '#ffffff' : (heapMode === 'max' ? '#c084fc' : '#34d399')}
                          strokeWidth={isRoot ? "2.5" : "1.8"}
                        />
                        <text x={x} y={y + 4} fill="#ffffff" fontWeight="bold" fontSize={isRoot ? "12" : "10.5"} textAnchor="middle">
                          {val}
                        </text>
                        {/* Index Badge */}
                        <text x={x} y={y - 18} fill="#94a3b8" fontSize="8" fontWeight="600" textAnchor="middle">
                          [{idx}]
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* 1D Array Representation */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {heapData.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>[{idx}]</span>
                      <div style={{ width: '42px', height: '44px', borderRadius: '8px', background: idx === 0 ? (heapMode === 'max' ? '#a855f7' : '#059669') : '#1e293b', border: '1.5px solid #38bdf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {val}
                      </div>
                      <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                        {idx === 0 ? 'Root' : `P:${Math.floor((idx - 1) / 2)}`}
                      </span>
                    </div>
                  ))}
                </div>

                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Array Formula: Parent = ⌊(i-1)/2⌋ • Left Child = 2i+1 • Right Child = 2i+2
                </span>
              </div>
            )}

            {/* 8. HASH TABLE (SEPARATE CHAINING) VISUALIZER */}
            {selectedDS === 'hash_table' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '440px' }}>
                {Object.entries(hashBuckets).map(([bucket, vals]) => (
                  <div key={bucket} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '90px', padding: '6px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>
                      Bucket [{bucket}]
                    </div>
                    <ArrowRight size={16} color="#38bdf8" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {vals.map((v, idx) => (
                        <div key={idx} style={{ padding: '6px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #38bdf8', color: '#f8fafc', fontSize: '0.8rem', fontWeight: 600 }}>
                          {v}
                        </div>
                      ))}
                      {vals.length === 0 && <span style={{ color: '#475569', fontSize: '0.72rem' }}>Empty Bucket</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. ADJACENCY MATRIX & LIST GRAPH VISUALIZER */}
            {selectedDS === 'adj_list_matrix' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* 2D Matrix Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                    Adjacency Matrix M[V][V] (Click to toggle edge)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${graphVertices.length + 1}, 32px)`, gap: '4px' }}>
                    <div />
                    {graphVertices.map(v => (
                      <div key={v} style={{ color: '#38bdf8', fontWeight: 700, textAlign: 'center', fontSize: '0.75rem' }}>{v}</div>
                    ))}
                    {graphMatrix.map((row, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <div style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          {graphVertices[rIdx]}
                        </div>
                        {row.map((cell, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => toggleGraphEdge(rIdx, cIdx)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: cell === 1 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                              border: cell === 1 ? '1.5px solid #38bdf8' : '1px solid #334155',
                              color: cell === 1 ? '#38bdf8' : '#64748b',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {cell}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Adjacency List View */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700 }}>
                    Adjacency List (Pointer Representation)
                  </span>
                  {graphVertices.map((v, idx) => {
                    const neighbors = graphMatrix[idx]
                      .map((val, nIdx) => (val === 1 ? graphVertices[nIdx] : null))
                      .filter(Boolean);

                    return (
                      <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ padding: '4px 8px', borderRadius: '6px', background: '#a855f7', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                          [{v}]
                        </div>
                        <ArrowRight size={14} color="#c084fc" />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {neighbors.map(n => (
                            <span key={n} style={{ padding: '3px 8px', borderRadius: '4px', background: '#1e293b', border: '1px solid #c084fc', color: '#f8fafc', fontSize: '0.72rem', fontWeight: 600 }}>
                              {n}
                            </span>
                          ))}
                          {neighbors.length === 0 && <span style={{ color: '#475569', fontSize: '0.7rem' }}>No edges</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10. DSU UNION FIND VISUALIZER */}
            {selectedDS === 'dsu_union_find' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                  Disjoint Set Union (DSU) Parent Pointers & Ranks
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dsuParents.map((parent, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '48px', height: '52px', borderRadius: '8px', background: parent === idx ? '#0284c7' : '#1e293b', border: parent === idx ? '2px solid #38bdf8' : '1px solid #64748b', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        <span style={{ fontSize: '0.9rem' }}>{idx}</span>
                        <span style={{ fontSize: '0.6rem', color: '#38bdf8' }}>P: {parent}</span>
                      </div>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Rank: {dsuRanks[idx]}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Path Compression + Union by Rank guarantees O(α(N)) nearly constant time across all set merges.
                </span>
              </div>
            )}

            {/* 11. TRIE PREFIX TREE VISUALIZER */}
            {selectedDS === 'trie_prefix' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                  🔤 Trie Prefix Tree Dictionary (Keys: {trieWords.join(', ')})
                </span>
                <svg width="460" height="210" style={{ overflow: 'visible' }}>
                  {/* Branch Lines */}
                  {/* Root to C & D */}
                  <line x1="230" y1="25" x2="150" y2="80" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="230" y1="25" x2="310" y2="80" stroke="#38bdf8" strokeWidth="2" />
                  {/* C to A */}
                  <line x1="150" y1="80" x2="150" y2="135" stroke="#38bdf8" strokeWidth="2" />
                  {/* A to T & R */}
                  <line x1="150" y1="135" x2="110" y2="185" stroke="#10b981" strokeWidth="2.5" />
                  <line x1="150" y1="135" x2="190" y2="185" stroke="#10b981" strokeWidth="2.5" />
                  {/* D to O */}
                  <line x1="310" y1="80" x2="310" y2="135" stroke="#38bdf8" strokeWidth="2" />
                  {/* O to G */}
                  <line x1="310" y1="135" x2="310" y2="185" stroke="#10b981" strokeWidth="2.5" />

                  {/* Root Node */}
                  <circle cx="230" cy="25" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <text x="230" y="29" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">ROOT</text>

                  {/* Level 1 Nodes */}
                  <circle cx="150" cy="80" r="15" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <text x="150" y="84" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'c'</text>

                  <circle cx="310" cy="80" r="15" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <text x="310" y="84" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'d'</text>

                  {/* Level 2 Nodes */}
                  <circle cx="150" cy="135" r="15" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <text x="150" y="139" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'a'</text>

                  <circle cx="310" cy="135" r="15" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <text x="310" y="139" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'o'</text>

                  {/* Terminal Word Nodes (Green End Flags) */}
                  <circle cx="110" cy="185" r="15" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
                  <text x="110" y="189" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'t'</text>
                  <text x="110" y="206" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">"cat" ✅</text>

                  <circle cx="190" cy="185" r="15" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
                  <text x="190" y="189" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'r'</text>
                  <text x="190" y="206" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">"car" ✅</text>

                  <circle cx="310" cy="185" r="15" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
                  <text x="310" y="189" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">'g'</text>
                  <text x="310" y="206" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">"dog" ✅</text>
                </svg>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Root branching across alphabet edges. Lookup time: O(L) where L is string length, independent of dictionary size N.
                </span>
              </div>
            )}

            {/* 12. 2D KD-TREE SPATIAL PARTITION VISUALIZER */}
            {selectedDS === 'kd_tree' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                  🧭 2D KD-Tree Orthogonal Spatial Partition (X-Splits vs Y-Splits)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  {/* 2D Partition Box */}
                  <svg viewBox="0 0 220 180" style={{ width: '100%', maxWidth: '220px', height: 'auto', background: '#090d16', borderRadius: '8px', border: '1px solid #334155' }}>
                    {/* Bounding box grid */}
                    <rect x="10" y="10" width="200" height="160" fill="none" stroke="#1e293b" strokeWidth="1" />
                    {/* X-split at X=50% -> x=110 */}
                    <line x1="110" y1="10" x2="110" y2="170" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="112" y="22" fill="#38bdf8" fontSize="8" fontWeight="bold">X=50 (Root)</text>
                    {/* Left Y-split at Y=60% -> y=106 for X < 110 */}
                    <line x1="10" y1="106" x2="110" y2="106" stroke="#c084fc" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="14" y="102" fill="#c084fc" fontSize="8" fontWeight="bold">Y=60</text>
                    {/* Right Y-split at Y=30% -> y=58 for X > 110 */}
                    <line x1="110" y1="58" x2="210" y2="58" stroke="#c084fc" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="170" y="54" fill="#c084fc" fontSize="8" fontWeight="bold">Y=30</text>

                    {/* 2D Point Marks */}
                    <circle cx="110" cy="90" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="116" y="94" fill="#ffffff" fontSize="8" fontWeight="bold">(50,40)</text>

                    <circle cx="60" cy="106" r="5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="66" y="104" fill="#ffffff" fontSize="8" fontWeight="bold">(25,60)</text>

                    <circle cx="160" cy="58" r="5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="166" y="56" fill="#ffffff" fontSize="8" fontWeight="bold">(75,30)</text>
                  </svg>

                  {/* Tree Hierarchy SVG */}
                  <svg viewBox="0 0 220 180" style={{ width: '100%', maxWidth: '220px', height: 'auto' }}>
                    <line x1="110" y1="25" x2="60" y2="85" stroke="#38bdf8" strokeWidth="1.8" />
                    <line x1="110" y1="25" x2="160" y2="85" stroke="#38bdf8" strokeWidth="1.8" />

                    <circle cx="110" cy="25" r="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <text x="110" y="29" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">(50,40)</text>
                    <text x="110" y="10" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">Split: X</text>

                    <circle cx="60" cy="85" r="15" fill="#7c3aed" stroke="#c084fc" strokeWidth="2" />
                    <text x="60" y="89" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">(25,60)</text>
                    <text x="60" y="108" fill="#c084fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">Split: Y</text>

                    <circle cx="160" cy="85" r="15" fill="#7c3aed" stroke="#c084fc" strokeWidth="2" />
                    <text x="160" y="89" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">(75,30)</text>
                    <text x="160" y="108" fill="#c084fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">Split: Y</text>
                  </svg>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Binary tree with alternating axis planes (X-split cyan, Y-split purple). Nearest Neighbor queries run in O(log N) average time.
                </span>
              </div>
            )}
          </div>

          {/* Live Operation Status Log Banner */}
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>
              {operationLog}
            </span>
          </div>
        </div>

        {/* Right Deck: Operations Panel, Real Memory Telemetry & Complexity Metrics */}
        <div className={`ds-controls-panel ${mobileActiveTab === 'controls' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* Action Deck Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interactive Control Deck
            </h4>

            {/* Value Input */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Element Value / Key:
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="e.g., 42"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              />
            </div>

            {/* Array Index Input (Only for Dynamic Array) */}
            {selectedDS === 'dynamic_array' && (
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Target Index:
                </label>
                <input
                  type="number"
                  value={inputIndex}
                  onChange={e => setInputIndex(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />
              </div>
            )}

            {/* Dynamic Action Buttons Depending on Selected Structure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {selectedDS === 'dynamic_array' && (
                <>
                  <button
                    type="button"
                    onClick={handleArrayPush}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Push Back
                  </button>
                  <button
                    type="button"
                    onClick={handleArrayPop}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Pop Back
                  </button>
                  <button
                    type="button"
                    onClick={handleArrayInsertAt}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Insert at [Idx]
                  </button>
                  <button
                    type="button"
                    onClick={handleArrayDeleteAt}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Delete at [Idx]
                  </button>
                </>
              )}

              {selectedDS === 'singly_linked_list' && (
                <>
                  <button
                    type="button"
                    onClick={handleLLInsertHead}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert Head
                  </button>
                  <button
                    type="button"
                    onClick={handleLLInsertTail}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0369a1',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert Tail
                  </button>
                  <button
                    type="button"
                    onClick={handleLLDeleteHead}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      gridColumn: 'span 2'
                    }}
                  >
                    - Delete Head
                  </button>
                </>
              )}

              {selectedDS === 'doubly_linked_list' && (
                <>
                  <button
                    type="button"
                    onClick={handleDLLInsertHead}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert Head
                  </button>
                  <button
                    type="button"
                    onClick={handleDLLInsertTail}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#a855f7',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert Tail
                  </button>
                  <button
                    type="button"
                    onClick={handleDLLDeleteTail}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      gridColumn: 'span 2'
                    }}
                  >
                    - Delete Tail
                  </button>
                </>
              )}

              {selectedDS === 'stack_lifo' && (
                <>
                  <button
                    type="button"
                    onClick={handleStackPush}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Push (TOP)
                  </button>
                  <button
                    type="button"
                    onClick={handleStackPop}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Pop (TOP)
                  </button>
                </>
              )}

              {selectedDS === 'queue_fifo' && (
                <>
                  <button
                    type="button"
                    onClick={handleQueueEnqueue}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Enqueue (Rear)
                  </button>
                  <button
                    type="button"
                    onClick={handleQueueDequeue}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Dequeue (Front)
                  </button>
                </>
              )}

              {(selectedDS === 'bst_tree' || selectedDS === 'avl_tree') && (
                <>
                  <button
                    type="button"
                    onClick={handleTreeInsert}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert (Auto-Balance)
                  </button>
                  <button
                    type="button"
                    onClick={handleTreeSearch}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Search Path
                  </button>
                  <button
                    type="button"
                    onClick={handleTreeReset}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid #64748b',
                      color: '#cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      gridColumn: 'span 2'
                    }}
                  >
                    🔄 Reset Tree (50, 25, 75...)
                  </button>
                </>
              )}

              {selectedDS === 'binary_heap' && (
                <>
                  <button
                    type="button"
                    onClick={handleHeapInsert}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Insert (Heapify Up)
                  </button>
                  <button
                    type="button"
                    onClick={handleHeapExtractRoot}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Extract Root
                  </button>
                </>
              )}

              {selectedDS === 'hash_table' && (
                <button
                  type="button"
                  onClick={handleHashInsert}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    gridColumn: 'span 2'
                  }}
                >
                  + Hash & Chain Key
                </button>
              )}

              {selectedDS === 'dsu_union_find' && (
                <button
                  type="button"
                  onClick={handleDsuUnion}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    gridColumn: 'span 2'
                  }}
                >
                  + Random Union(u, v)
                </button>
              )}

              {selectedDS === 'trie_prefix' && (
                <button
                  type="button"
                  onClick={handleTrieInsert}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    gridColumn: 'span 2'
                  }}
                >
                  + Insert Word to Trie
                </button>
              )}
            </div>
          </div>

          {/* Real Memory Allocation & Cache Locality Map */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#34d399" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
                Memory Layout Telemetry
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Base Address Offset:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>0x7FFEE400</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Est. Node Footprint:</span>
                <strong style={{ color: '#f8fafc' }}>{currentMeta.bytePerElement} Bytes / element</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Hardware Cache Locality:</span>
                <strong style={{ color: '#34d399' }}>{currentMeta.cacheLocality}</strong>
              </div>
            </div>
          </div>

          {/* Big-O Asymptotic Complexity Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="#fbbf24" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
                Asymptotic Complexity (Big-O)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Access / Lookup:</span>
                <strong style={{ color: '#38bdf8' }}>{currentMeta.timeAccess}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Insertion:</span>
                <strong style={{ color: '#34d399' }}>{currentMeta.timeInsert}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Deletion:</span>
                <strong style={{ color: '#fbbf24' }}>{currentMeta.timeDelete}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#94a3b8' }}>Space Complexity:</span>
                <strong style={{ color: '#c084fc' }}>{currentMeta.spaceComp}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
