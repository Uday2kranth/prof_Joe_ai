import { describe, it, expect } from 'vitest';

describe('Layer 3: DSA Step & Algorithmic Invariants', () => {
  describe('1. Sorting Algorithm Invariants', () => {
    it('should maintain strict ascending sort order and preserve multi-set elements', () => {
      const input = [64, 34, 25, 12, 22, 11, 90, 22, -5, 0];
      const sorted = [...input].sort((a, b) => a - b);

      // Verify length invariant
      expect(sorted.length).toBe(input.length);

      // Verify monotonicity invariant: sorted[i] <= sorted[i+1]
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
      }

      // Verify multi-set permutation conservation
      const sumOriginal = input.reduce((a, b) => a + b, 0);
      const sumSorted = sorted.reduce((a, b) => a + b, 0);
      expect(sumSorted).toBe(sumOriginal);
    });

    it('should satisfy Max-Heap property in Heapsort parent-child indices', () => {
      // 0-indexed max heap: parent(i) = Math.floor((i-1)/2), left(i) = 2i+1, right(i) = 2i+2
      const heapify = (arr: number[], n: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest !== i) {
          [arr[i], arr[largest]] = [arr[largest], arr[i]];
          heapify(arr, n, largest);
        }
      };

      const buildMaxHeap = (arr: number[]) => {
        const n = arr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
          heapify(arr, n, i);
        }
      };

      const data = [15, 10, 8, 12, 20, 25, 6, 30];
      buildMaxHeap(data);

      // Verify max heap invariant: data[i] >= data[2i+1] and data[i] >= data[2i+2]
      for (let i = 0; i < Math.floor(data.length / 2); i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < data.length) expect(data[i]).toBeGreaterThanOrEqual(data[left]);
        if (right < data.length) expect(data[i]).toBeGreaterThanOrEqual(data[right]);
      }
    });
  });

  describe('2. Binary Search Tree (BST) & AVL Balance Invariants', () => {
    interface TreeNode {
      val: number;
      left?: TreeNode;
      right?: TreeNode;
      height: number;
    }

    const getHeight = (node?: TreeNode): number => node?.height || 0;

    const insertBST = (root: TreeNode | undefined, val: number): TreeNode => {
      if (!root) return { val, height: 1 };
      if (val < root.val) root.left = insertBST(root.left, val);
      else root.right = insertBST(root.right, val);
      root.height = 1 + Math.max(getHeight(root.left), getHeight(root.right));
      return root;
    };

    it('should maintain monotonic strictly ascending sequence on Inorder Traversal', () => {
      let root: TreeNode | undefined;
      const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 65];
      for (const v of values) {
        root = insertBST(root, v);
      }

      const inorderList: number[] = [];
      const inorder = (node?: TreeNode) => {
        if (!node) return;
        inorder(node.left);
        inorderList.push(node.val);
        inorder(node.right);
      };
      inorder(root);

      expect(inorderList).toEqual([...values].sort((a, b) => a - b));
    });
  });

  describe('3. Graph & Shortest Path Triangle Inequality Invariants', () => {
    it('should satisfy Dijkstra relaxation triangle inequality: d[v] <= d[u] + weight(u,v)', () => {
      // Graph with vertices 0..4
      // Edges: [u, v, weight]
      const edges: Array<[number, number, number]> = [
        [0, 1, 4],
        [0, 2, 2],
        [1, 2, 1],
        [1, 3, 5],
        [2, 3, 8],
        [2, 4, 10],
        [3, 4, 2]
      ];
      const numNodes = 5;
      const dist = new Array(numNodes).fill(Infinity);
      dist[0] = 0;

      // Bellman-Ford relaxation to compute ground truth shortest paths
      for (let i = 0; i < numNodes - 1; i++) {
        for (const [u, v, w] of edges) {
          if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
          }
          // Undirected edge check
          if (dist[v] !== Infinity && dist[v] + w < dist[u]) {
            dist[u] = dist[v] + w;
          }
        }
      }

      // Check triangle inequality for all reachable edges
      for (const [u, v, w] of edges) {
        expect(dist[v]).toBeLessThanOrEqual(dist[u] + w);
        expect(dist[u]).toBeLessThanOrEqual(dist[v] + w);
      }
      expect(dist[4]).toBe(10); // 0 -> 2 (2) + 2 -> 1 (1) + 1 -> 3 (5) + 3 -> 4 (2) = 10
    });
  });


  describe('4. Dynamic Programming Optimal Substructure Invariants', () => {
    it('should solve 0/1 Knapsack problem with exact recurrence matching', () => {
      const weights = [1, 2, 3, 5];
      const values = [1, 6, 10, 16];
      const W = 7;
      const n = weights.length;

      const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

      for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
          if (weights[i - 1] <= w) {
            dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
          } else {
            dp[i][w] = dp[i - 1][w];
          }
        }
      }

      // Max value for capacity 7: item 2 (w=2,v=6) + item 4 (w=5,v=16) = 22
      expect(dp[n][W]).toBe(22);
    });
  });
});
