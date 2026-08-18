import type { DsaAlgorithmMeta, DsaCategory } from './types';

export const DSA_CATEGORIES: { id: DsaCategory; title: string; icon: string; count: number; desc: string }[] = [
  { id: 'sorting', title: '1. Sorting Algorithms', icon: '📶', count: 9, desc: 'Divide & conquer, comparison, and non-comparison sorts' },
  { id: 'searching', title: '2. Searching & Pointers', icon: '🔍', count: 3, desc: 'Linear search, binary search window halving & two pointers' },
  { id: 'data_structures', title: '3. Data Structures', icon: '🧱', count: 12, desc: 'Linear arrays, linked lists, stacks, queues, BST, AVL, RB, Trie & Heaps' },
  { id: 'graph', title: '4. Graph Algorithms', icon: '🕸️', count: 8, desc: 'Shortest paths, BFS/DFS traversals, spanning trees & random generator' },
  { id: 'recursion', title: '5. Recursion Visualizer', icon: '🌀', count: 2, desc: 'Dynamic call tree branching, live stack ribbon & line trace' },
  { id: 'dp', title: '6. Dynamic Programming', icon: '🧮', count: 4, desc: 'Overlapping subproblems, optimal substructure & table fills' },
  { id: 'backtracking', title: '7. Backtracking', icon: '♟️', count: 2, desc: 'State-space trees, exhaustive constraint satisfaction & prune' },
  { id: 'greedy_strings', title: '8. Greedy & Strings', icon: '🔤', count: 4, desc: 'Prefix tables, pattern matching & optimal prefix encodings' }
];

export const DSA_ALGORITHMS: Record<string, DsaAlgorithmMeta> = {
  // --- 1. SORTING ---
  bubble_sort: {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    tag: 'COMPARISON',
    timeComplexityBest: 'O(n)',
    timeComplexityAverage: 'O(n²)',
    timeComplexityWorst: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Iteratively compares adjacent elements and swaps them if they are in the wrong order until the entire array is sorted.',
    mathFormula: 'T(n) = \\sum_{i=1}^{n-1} (n - i) = \\frac{n(n - 1)}{2} = O(n^2)',
    pseudoCode: `procedure bubbleSort(A : list of sortable items)
    n = length(A)
    repeat
        swapped = false
        for i = 1 to n-1 inclusive do
            if A[i-1] > A[i] then
                swap(A[i-1], A[i])
                swapped = true
            end if
        end for
        n = n - 1
    until not swapped
end procedure`,
    pythonCode: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    cppCode: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
    javaCode: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`
  },

  quick_sort: {
    id: 'quick_sort',
    name: 'Quick Sort (Lomuto Partition)',
    category: 'sorting',
    tag: 'DIVIDE & CONQUER',
    timeComplexityBest: 'O(n log n)',
    timeComplexityAverage: 'O(n log n)',
    timeComplexityWorst: 'O(n²)',
    spaceComplexity: 'O(log n)',
    description: 'Selects a pivot element, partitions the array such that smaller elements are placed to the left and larger to the right, and recursively sorts subarrays.',
    mathFormula: 'T(n) = 2T(n/2) + \\Theta(n) \\implies T(n) = \\Theta(n \\log n)',
    pseudoCode: `procedure quickSort(A, low, high)
    if low < high then
        p = partition(A, low, high)
        quickSort(A, low, p - 1)
        quickSort(A, p + 1, high)
    end if
end procedure

function partition(A, low, high)
    pivot = A[high]
    i = low - 1
    for j = low to high - 1 do
        if A[j] <= pivot then
            i = i + 1
            swap(A[i], A[j])
        end if
    end for
    swap(A[i + 1], A[high])
    return i + 1
end function`,
    pythonCode: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    cppCode: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
    javaCode: `static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
    }
    int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
    return i + 1;
}`
  },

  merge_sort: {
    id: 'merge_sort',
    name: 'Merge Sort',
    category: 'sorting',
    tag: 'DIVIDE & CONQUER',
    timeComplexityBest: 'O(n log n)',
    timeComplexityAverage: 'O(n log n)',
    timeComplexityWorst: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides the unsorted array into two halves, recursively sorts both halves, and merges the two sorted halves into one sorted array.',
    mathFormula: 'T(n) = 2T(n/2) + cn \\implies T(n) = \\Theta(n \\log n)',
    pseudoCode: `procedure mergeSort(A, left, right)
    if left < right then
        mid = floor((left + right) / 2)
        mergeSort(A, left, mid)
        mergeSort(A, mid + 1, right)
        merge(A, left, mid, right)
    end if
end procedure`,
    pythonCode: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L, R = arr[:mid], arr[mid:]
        merge_sort(L); merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]: arr[k] = L[i]; i += 1
            else: arr[k] = R[j]; j += 1
            k += 1
        while i < len(L): arr[k] = L[i]; i += 1; k += 1
        while j < len(R): arr[k] = R[j]; j += 1; k += 1`,
    cppCode: `void merge(vector<int>& arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    vector<int> L(n1), R(n2);
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
    javaCode: `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`
  },

  heap_sort: {
    id: 'heap_sort',
    name: 'Heap Sort',
    category: 'sorting',
    tag: 'TREE-BASED',
    timeComplexityBest: 'O(n log n)',
    timeComplexityAverage: 'O(n log n)',
    timeComplexityWorst: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Builds a Max-Heap from input data, then repeatedly swaps root (max element) with the last element and heapifies the root.',
    mathFormula: 'T_{\\text{build}}(n) = O(n), \\quad T_{\\text{extract}}(n) = \\sum_{i=1}^n O(\\log i) = O(n \\log n)',
    pseudoCode: `procedure heapSort(A)
    n = length(A)
    for i = floor(n/2) - 1 down to 0 do
        heapify(A, n, i)
    end for
    for i = n - 1 down to 1 do
        swap(A[0], A[i])
        heapify(A, i, 0)
    end for
end procedure`,
    pythonCode: `def heapify(arr, n, i):
    largest = i
    l, r = 2 * i + 1, 2 * i + 2
    if l < n and arr[l] > arr[largest]: largest = l
    if r < n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1): heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)`,
    cppCode: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i, l = 2*i + 1, r = 2*i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
    javaCode: `public void sort(int arr[]) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}`
  },

  insertion_sort: {
    id: 'insertion_sort',
    name: 'Insertion Sort',
    category: 'sorting',
    tag: 'INCREMENTAL',
    timeComplexityBest: 'O(n)',
    timeComplexityAverage: 'O(n²)',
    timeComplexityWorst: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct sorted position.',
    mathFormula: 'T(n) = \\sum_{i=1}^{n-1} i = \\frac{n(n - 1)}{2} = O(n^2)',
    pseudoCode: `procedure insertionSort(A)
    for i = 1 to length(A) - 1 do
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key do
            A[j + 1] = A[j]
            j = j - 1
        end while
        A[j + 1] = key
    end for
end procedure`,
    pythonCode: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    cppCode: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    javaCode: `void insertionSort(int arr[]) {
    for (int i = 1; i < arr.length; ++i) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
  },

  selection_sort: {
    id: 'selection_sort',
    name: 'Selection Sort',
    category: 'sorting',
    tag: 'COMPARISON',
    timeComplexityBest: 'O(n²)',
    timeComplexityAverage: 'O(n²)',
    timeComplexityWorst: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the smallest element in the unsorted portion of the array and swaps it with the first unsorted element.',
    mathFormula: 'T(n) = (n-1) + (n-2) + \\dots + 1 = \\frac{n(n-1)}{2} = O(n^2)',
    pseudoCode: `procedure selectionSort(A)
    for i = 0 to length(A) - 2 do
        minIdx = i
        for j = i + 1 to length(A) - 1 do
            if A[j] < A[minIdx] then minIdx = j
        end for
        swap(A[i], A[minIdx])
    end for
end procedure`,
    pythonCode: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    cppCode: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[min_idx]) min_idx = j;
        swap(arr[min_idx], arr[i]);
    }
}`,
    javaCode: `void selectionSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[min_idx]) min_idx = j;
        int temp = arr[min_idx]; arr[min_idx] = arr[i]; arr[i] = temp;
    }
}`
  },

  counting_sort: {
    id: 'counting_sort',
    name: 'Counting Sort',
    category: 'sorting',
    tag: 'NON-COMPARISON',
    timeComplexityBest: 'O(n + k)',
    timeComplexityAverage: 'O(n + k)',
    timeComplexityWorst: 'O(n + k)',
    spaceComplexity: 'O(k)',
    description: 'Counts occurrences of each unique value in a frequency array and computes prefix sums to place elements directly into their sorted positions.',
    mathFormula: 'T(n, k) = O(n + k) \\quad \\text{where } k = \\max(A) - \\min(A) + 1',
    pseudoCode: `procedure countingSort(A, k)
    create count array of size k initialized to 0
    for each x in A do count[x] = count[x] + 1
    for i = 1 to k do count[i] = count[i] + count[i-1]
    for i = length(A)-1 down to 0 do
        output[count[A[i]] - 1] = A[i]
        count[A[i]] = count[A[i]] - 1
    end for
    return output
end procedure`,
    pythonCode: `def counting_sort(arr):
    if not arr: return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for x in arr: count[x] += 1
    for i in range(1, len(count)): count[i] += count[i-1]
    out = [0] * len(arr)
    for x in reversed(arr):
        out[count[x] - 1] = x
        count[x] -= 1
    return out`,
    cppCode: `void countingSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0), out(arr.size());
    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i-1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        out[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    arr = out;
}`,
    javaCode: `void countingSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[max + 1];
    for (int x : arr) count[x]++;
    for (int i = 1; i <= max; i++) count[i] += count[i - 1];
    int[] out = new int[arr.length];
    for (int i = arr.length - 1; i >= 0; i--) {
        out[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    System.arraycopy(out, 0, arr, 0, arr.length);
}`
  },

  radix_sort: {
    id: 'radix_sort',
    name: 'Radix Sort (LSD)',
    category: 'sorting',
    tag: 'NON-COMPARISON',
    timeComplexityBest: 'O(d · (n + b))',
    timeComplexityAverage: 'O(d · (n + b))',
    timeComplexityWorst: 'O(d · (n + b))',
    spaceComplexity: 'O(n + b)',
    description: 'Processes digits from Least Significant Digit (LSD) to Most Significant Digit (MSD) using stable counting sort on each digit base.',
    mathFormula: 'T(n, d, b) = O(d(n + b)) \\quad \\text{where } d = \\lfloor \\log_b(\\max A) \\rfloor + 1',
    pseudoCode: `procedure radixSort(A)
    maxVal = getMax(A)
    exp = 1
    while maxVal / exp > 0 do
        countSortByDigit(A, exp)
        exp = exp * 10
    end while
end procedure`,
    pythonCode: `def radix_sort(arr):
    max_val = max(arr) if arr else 0
    exp = 1
    while max_val // exp > 0:
        counting_sort_exp(arr, exp)
        exp *= 10
    return arr`,
    cppCode: `void radixSort(vector<int>& arr) {
    int m = *max_element(arr.begin(), arr.end());
    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, exp);
}`,
    javaCode: `static void radixsort(int arr[], int n) {
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, n, exp);
}`
  },

  // --- 2. SEARCHING & TWO POINTERS ---
  binary_search: {
    id: 'binary_search',
    name: 'Binary Search',
    category: 'searching',
    tag: 'LOGARITHMIC',
    timeComplexityBest: 'O(1)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Searches a sorted array by repeatedly halving the search interval [low, high] and comparing the middle element with the target.',
    mathFormula: 'T(n) = T(n/2) + O(1) \\implies T(n) = O(\\log_2 n)',
    pseudoCode: `function binarySearch(A, target)
    low = 0, high = length(A) - 1
    while low <= high do
        mid = low + floor((high - low) / 2)
        if A[mid] == target then return mid
        else if A[mid] < target then low = mid + 1
        else high = mid - 1
    end while
    return -1
end function`,
    pythonCode: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    cppCode: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    javaCode: `int binarySearch(int arr[], int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
  },

  two_pointers: {
    id: 'two_pointers',
    name: 'Two-Pointer Technique (2-Sum)',
    category: 'searching',
    tag: 'TWO POINTERS',
    timeComplexityBest: 'O(1)',
    timeComplexityAverage: 'O(n)',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Maintains two pointers (left and right) at opposite ends of a sorted array, shifting inwards based on whether the current sum is less or greater than the target.',
    mathFormula: '\\text{Sum} = A[L] + A[R], \\quad L \\leftarrow L+1 \\text{ if Sum} < K, \\quad R \\leftarrow R-1 \\text{ if Sum} > K',
    pseudoCode: `function twoSumSorted(A, target)
    left = 0, right = length(A) - 1
    while left < right do
        sum = A[left] + A[right]
        if sum == target then return (left, right)
        else if sum < target then left = left + 1
        else right = right - 1
    end while
    return null
end function`,
    pythonCode: `def two_sum_sorted(arr, target):
    l, r = 0, len(arr) - 1
    while l < r:
        s = arr[l] + arr[r]
        if s == target: return (l, r)
        elif s < target: l += 1
        else: r -= 1
    return None`,
    cppCode: `pair<int, int> twoSum(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l < r) {
        int s = arr[l] + arr[r];
        if (s == target) return {l, r};
        if (s < target) l++;
        else r--;
    }
    return {-1, -1};
}`,
    javaCode: `public int[] twoSum(int[] arr, int target) {
    int l = 0, r = arr.length - 1;
    while (l < r) {
        int s = arr[l] + arr[r];
        if (s == target) return new int[]{l, r};
        if (s < target) l++;
        else r--;
    }
    return new int[]{-1, -1};
}`
  },

  // --- 3. DATA STRUCTURES (8 FOUNDATIONS + ADVANCED) ---
  array_ds: {
    id: 'array_ds',
    name: 'Array (Contiguous Memory)',
    category: 'data_structures',
    tag: 'CONTIGUOUS BUFFER',
    timeComplexityBest: 'O(1) Access',
    timeComplexityAverage: 'O(n) Insert/Delete',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Sequential fixed-size memory collection where each element occupies equal contiguous byte slots, enabling O(1) random index access via memory address arithmetic: Address = Base + i × Size.',
    mathFormula: '\\text{Address}(A[i]) = \\text{Base} + i \\times \\text{sizeof}(\\text{element})',
    pseudoCode: `procedure insertAtIndex(A, n, index, value)
    for i = n down to index + 1 do
        A[i] = A[i - 1]
    end for
    A[index] = value
end procedure`,
    pythonCode: `class ArrayDemo:
    def __init__(self, capacity=10):
        self.data = [0] * capacity
        self.size = 0

    def insert_at(self, index, val):
        for i in range(self.size, index, -1):
            self.data[i] = self.data[i - 1]
        self.data[index] = val
        self.size += 1`,
    cppCode: `template <typename T>
class ArrayBuffer {
    T* data;
    int capacity, size;
public:
    ArrayBuffer(int cap = 10) : capacity(cap), size(0) {
        data = new T[capacity];
    }
    void insertAt(int idx, T val) {
        for (int i = size; i > idx; i--) data[i] = data[i - 1];
        data[idx] = val;
        size++;
    }
};`,
    javaCode: `public class ArrayVisualizer {
    private int[] data;
    private int size;
    public ArrayVisualizer(int cap) { data = new int[cap]; size = 0; }
    public void insertAt(int idx, int val) {
        for (int i = size; i > idx; i--) data[i] = data[i - 1];
        data[idx] = val;
        size++;
    }
}`
  },

  string_ds: {
    id: 'string_ds',
    name: 'String & Palindrome Two-Pointer',
    category: 'data_structures',
    tag: 'CHARACTER SEQUENCE',
    timeComplexityBest: 'O(1) Char Access',
    timeComplexityAverage: 'O(n) Search/Reverse',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Sequence of characters stored contiguously with 0-based indices and ASCII byte mappings. Supports in-place reversal, two-pointer palindrome symmetry checks, and frequency histogram mapping.',
    mathFormula: 's = \\langle c_0, c_1, \\dots, c_{n-1} \\rangle, \\quad \\text{Palindrome} \\iff \\forall i : s[i] = s[n - 1 - i]',
    pseudoCode: `function isPalindrome(s)
    left = 0, right = length(s) - 1
    while left < right do
        if s[left] != s[right] then return false
        left = left + 1, right = right - 1
    end while
    return true
end function`,
    pythonCode: `def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
    cppCode: `bool isPalindrome(const string& s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}`,
    javaCode: `public static boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++; right--;
    }
    return true;
}`
  },

  singly_linked_list: {
    id: 'singly_linked_list',
    name: 'Singly Linked List',
    category: 'data_structures',
    tag: 'ONE-WAY CHAIN',
    timeComplexityBest: 'O(1) Prepend Head',
    timeComplexityAverage: 'O(n) Append / Delete',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Dynamic one-way chain of discrete nodes where each node contains data and a single forward pointer (next) pointing to the successor, terminating at NULL.',
    mathFormula: '\\text{Node}(v) = \\{ \\text{data}: v, \\; \\text{next}: \\text{Node}^* \\mid \\text{tail.next} = \\text{null} \\}',
    pseudoCode: `class Node: data, next
procedure prepend(val):
    newNode = Node(val)
    newNode.next = head
    head = newNode
procedure reverse():
    prev = null, curr = head
    while curr != null do
        nextTemp = curr.next
        curr.next = prev
        prev = curr
        curr = nextTemp
    end while
    head = prev`,
    pythonCode: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def prepend(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def reverse(self):
        prev, curr = None, self.head
        while curr:
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp
        self.head = prev`,
    cppCode: `struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

class SinglyLinkedList {
    Node* head = nullptr;
public:
    void prepend(int d) {
        Node* n = new Node(d);
        n->next = head;
        head = n;
    }
    void reverse() {
        Node *prev = nullptr, *curr = head, *next = nullptr;
        while (curr) {
            next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        head = prev;
    }
};`,
    javaCode: `public class SinglyLinkedList {
    static class Node {
        int data;
        Node next;
        Node(int d) { data = d; }
    }
    private Node head;
    public void prepend(int d) {
        Node n = new Node(d);
        n.next = head;
        head = n;
    }
    public void reverse() {
        Node prev = null, curr = head;
        while (curr != null) {
            Node next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        head = prev;
    }
}`
  },

  doubly_linked_list: {
    id: 'doubly_linked_list',
    name: 'Doubly Linked List',
    category: 'data_structures',
    tag: 'TWO-WAY POINTERS',
    timeComplexityBest: 'O(1) Head/Tail Insert',
    timeComplexityAverage: 'O(n) Search',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Linear data structure where every node holds data, a forward next pointer, and a backward prev pointer, allowing efficient bidirectional traversal.',
    mathFormula: '\\text{Node}(v) = \\{ \\text{prev}: \\text{Node}^*, \\; \\text{data}: v, \\; \\text{next}: \\text{Node}^* \\}',
    pseudoCode: `class Node: data, next, prev
procedure insertHead(val):
    newNode = Node(val)
    newNode.next = head
    if head != null then head.prev = newNode
    head = newNode`,
    pythonCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def append(self, val):
        n = Node(val)
        if not self.tail:
            self.head = self.tail = n
        else:
            self.tail.next = n
            n.prev = self.tail
            self.tail = n`,
    cppCode: `struct Node {
    int val;
    Node *prev, *next;
    Node(int v) : val(v), prev(nullptr), next(nullptr) {}
};`,
    javaCode: `public class DoublyLinkedList {
    static class Node {
        int val;
        Node prev, next;
        Node(int v) { val = v; }
    }
}`
  },

  circular_linked_list: {
    id: 'circular_linked_list',
    name: 'Circular Linked List',
    category: 'data_structures',
    tag: 'RING BUFFER',
    timeComplexityBest: 'O(1) Head/Tail Insert',
    timeComplexityAverage: 'O(n) Search/Traversal',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Continuous ring topology where the tail node reconnects directly to the head node (tail.next == head). Ideal for round-robin CPU scheduling and game turn management.',
    mathFormula: '\\text{Cycle Condition}: \\text{tail}.\\text{next} = \\text{head} \\ne \\text{null}',
    pseudoCode: `procedure traverseLoop(head)
    if head == null then return
    curr = head
    repeat
        visit(curr.data)
        curr = curr.next
    until curr == head
end procedure`,
    pythonCode: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class CircularLinkedList:
    def __init__(self):
        self.head = None

    def insert_tail(self, data):
        n = Node(data)
        if not self.head:
            self.head = n
            n.next = self.head
            return
        curr = self.head
        while curr.next != self.head:
            curr = curr.next
        curr.next = n
        n.next = self.head`,
    cppCode: `struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

void traverse(Node* head) {
    if (!head) return;
    Node* curr = head;
    do {
        cout << curr->data << " -> ";
        curr = curr->next;
    } while (curr != head);
    cout << "(HEAD)" << endl;
}`,
    javaCode: `public class CircularLinkedList {
    static class Node {
        int data;
        Node next;
        Node(int d) { data = d; }
    }
    public void traverse(Node head) {
        if (head == null) return;
        Node curr = head;
        do {
            System.out.print(curr.data + " -> ");
            curr = curr.next;
        } while (curr != head);
    }
}`
  },

  stack_ds: {
    id: 'stack_ds',
    name: 'Stack (LIFO Reactor)',
    category: 'data_structures',
    tag: 'LAST-IN FIRST-OUT',
    timeComplexityBest: 'O(1) Push / Pop / Peek',
    timeComplexityAverage: 'O(1)',
    timeComplexityWorst: 'O(1)',
    spaceComplexity: 'O(n)',
    description: 'Last-In, First-Out (LIFO) linear data structure where all element additions (Push), removals (Pop), and inspections (Peek) occur strictly at the top hatch.',
    mathFormula: 'S = \\langle e_1, e_2, \\dots, e_k \\rangle, \\quad \\text{Top} = e_k, \\quad \\text{Pop}(S) \\implies S\' = \\langle e_1, \\dots, e_{k-1} \\rangle',
    pseudoCode: `procedure push(S, val)
    if S.size == S.capacity then error "Overflow"
    S.top = S.top + 1
    S.data[S.top] = val
procedure pop(S)
    if S.top == -1 then error "Underflow"
    val = S.data[S.top]
    S.top = S.top - 1
    return val`,
    pythonCode: `class Stack:
    def __init__(self, capacity=8):
        self.items = []
        self.capacity = capacity

    def push(self, item):
        if len(self.items) >= self.capacity:
            raise Exception("Stack Overflow")
        self.items.append(item)

    def pop(self):
        if not self.items:
            raise Exception("Stack Underflow")
        return self.items.pop()

    def peek(self):
        return self.items[-1] if self.items else None`,
    cppCode: `class Stack {
    int top, cap;
    int* arr;
public:
    Stack(int c = 8) : cap(c), top(-1) { arr = new int[cap]; }
    void push(int x) { if (top < cap - 1) arr[++top] = x; }
    int pop() { return top >= 0 ? arr[top--] : -1; }
    int peek() { return top >= 0 ? arr[top] : -1; }
};`,
    javaCode: `public class Stack {
    private int[] arr;
    private int top, capacity;
    public Stack(int cap) { capacity = cap; arr = new int[cap]; top = -1; }
    public void push(int val) { if (top < capacity - 1) arr[++top] = val; }
    public int pop() { return top >= 0 ? arr[top--] : -1; }
    public int peek() { return top >= 0 ? arr[top] : -1; }
}`
  },

  queue_ds: {
    id: 'queue_ds',
    name: 'Queue (FIFO & Circular Buffer)',
    category: 'data_structures',
    tag: 'FIRST-IN FIRST-OUT',
    timeComplexityBest: 'O(1) Enqueue / Dequeue',
    timeComplexityAverage: 'O(1)',
    timeComplexityWorst: 'O(1)',
    spaceComplexity: 'O(n)',
    description: 'First-In, First-Out (FIFO) collection where elements enter at the REAR and leave from the FRONT. Includes circular ring buffer modulo wrap-around: rear = (rear + 1) mod Cap.',
    mathFormula: 'Q = \\langle e_1, e_2, \\dots, e_n \\rangle, \\quad \\text{Enqueue}(v) \\implies Q\' = \\langle e_1, \\dots, e_n, v \\rangle',
    pseudoCode: `procedure enqueue(Q, val)
    if (Q.rear + 1) mod Cap == Q.front then error "Overflow"
    Q.rear = (Q.rear + 1) mod Cap
    Q.data[Q.rear] = val
procedure dequeue(Q)
    if Q.front == Q.rear then error "Underflow"
    Q.front = (Q.front + 1) mod Cap
    return Q.data[Q.front]`,
    pythonCode: `from collections import deque

class Queue:
    def __init__(self, capacity=8):
        self.q = deque()
        self.capacity = capacity

    def enqueue(self, item):
        if len(self.q) >= self.capacity:
            raise Exception("Queue Overflow")
        self.q.append(item)

    def dequeue(self):
        if not self.q:
            raise Exception("Queue Underflow")
        return self.q.popleft()`,
    cppCode: `class CircularQueue {
    int front, rear, size, cap;
    int* arr;
public:
    CircularQueue(int c = 8) : cap(c), front(0), rear(-1), size(0) {
        arr = new int[cap];
    }
    void enqueue(int x) {
        if (size < cap) {
            rear = (rear + 1) % cap;
            arr[rear] = x;
            size++;
        }
    }
    int dequeue() {
        if (size > 0) {
            int val = arr[front];
            front = (front + 1) % cap;
            size--;
            return val;
        }
        return -1;
    }
};`,
    javaCode: `public class CircularQueue {
    private int[] arr;
    private int front = 0, rear = -1, size = 0, capacity;
    public CircularQueue(int cap) { capacity = cap; arr = new int[cap]; }
    public void enqueue(int x) {
        if (size < capacity) {
            rear = (rear + 1) % capacity;
            arr[rear] = x;
            size++;
        }
    }
    public int dequeue() {
        if (size > 0) {
            int val = arr[front];
            front = (front + 1) % capacity;
            size--;
            return val;
        }
        return -1;
    }
}`
  },

  hash_table: {
    id: 'hash_table',
    name: 'Hash Table (Chaining & Linear Probing)',
    category: 'data_structures',
    tag: 'O(1) KEY-VALUE MAP',
    timeComplexityBest: 'O(1) Search / Insert',
    timeComplexityAverage: 'O(1)',
    timeComplexityWorst: 'O(n) Collisions',
    spaceComplexity: 'O(n)',
    description: 'Associative array indexing data via hash function h(k) = k mod M. Resolves bucket collisions using Separate Chaining (linked lists) or Open Addressing (Linear Probing: (h(k) + i) mod M).',
    mathFormula: 'h(k) = k \\bmod M, \\quad \\text{Linear Probe}(k, i) = (h(k) + i) \\bmod M, \\quad \\alpha = \\frac{N}{M}',
    pseudoCode: `procedure insertChaining(table, key)
    idx = hash(key) mod M
    table[idx].append(key)
procedure insertProbing(table, key)
    idx = hash(key) mod M
    for i = 0 to M - 1 do
        slot = (idx + i) mod M
        if table[slot] == null then
            table[slot] = key
            return
        end if
    end for
end procedure`,
    pythonCode: `class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]

    def hash(self, key):
        return key % self.size

    def insert(self, key):
        idx = self.hash(key)
        if key not in self.table[idx]:
            self.table[idx].append(key)`,
    cppCode: `class HashTable {
    int M;
    vector<list<int>> table;
public:
    HashTable(int m = 7) : M(m), table(m) {}
    void insert(int key) {
        int idx = key % M;
        table[idx].push_back(key);
    }
};`,
    javaCode: `import java.util.LinkedList;

public class HashTable {
    private int M;
    private LinkedList<Integer>[] table;
    @SuppressWarnings("unchecked")
    public HashTable(int m) {
        M = m;
        table = new LinkedList[M];
        for (int i = 0; i < M; i++) table[i] = new LinkedList<>();
    }
    public void insert(int key) {
        int idx = key % M;
        table[idx].add(key);
    }
}`
  },

  binary_tree_ds: {
    id: 'binary_tree_ds',
    name: 'General Binary Tree (Hierarchy)',
    category: 'data_structures',
    tag: 'HIERARCHICAL TREE',
    timeComplexityBest: 'O(1) Insert Root',
    timeComplexityAverage: 'O(n) Search / Insert',
    timeComplexityWorst: 'O(n) Level-Order',
    spaceComplexity: 'O(n)',
    description: 'Hierarchical node structure where each node has at most 2 children (left and right) without value-ordering constraints. Supports level-order insertion, deletion, and 4 fundamental traversals: Inorder, Preorder, Postorder, and BFS.',
    mathFormula: '\\text{Max Nodes at Level } L = 2^L, \\quad \\text{Max Nodes for Height } h = 2^{h+1} - 1',
    pseudoCode: `procedure levelOrderInsert(root, value)
    newNode = createNode(value)
    if root is null then return newNode
    queue = [root]
    while queue is not empty do
        curr = queue.dequeue()
        if curr.left is null then
            curr.left = newNode; return root
        else queue.enqueue(curr.left)
        if curr.right is null then
            curr.right = newNode; return root
        else queue.enqueue(curr.right)
    end while
end procedure`,
    pythonCode: `from collections import deque

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert_level_order(self, val):
        new_node = TreeNode(val)
        if not self.root:
            self.root = new_node
            return
        q = deque([self.root])
        while q:
            curr = q.popleft()
            if not curr.left:
                curr.left = new_node
                return
            q.append(curr.left)
            if not curr.right:
                curr.right = new_node
                return
            q.append(curr.right)

    def inorder(self, node, res=None):
        if res is None: res = []
        if node:
            self.inorder(node.left, res)
            res.append(node.val)
            self.inorder(node.right, res)
        return res`,
    cppCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

class BinaryTree {
public:
    TreeNode* root = nullptr;

    void insertLevelOrder(int val) {
        TreeNode* newNode = new TreeNode(val);
        if (!root) { root = newNode; return; }
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* curr = q.front(); q.pop();
            if (!curr->left) { curr->left = newNode; return; }
            q.push(curr->left);
            if (!curr->right) { curr->right = newNode; return; }
            q.push(curr->right);
        }
    }
};`,
    javaCode: `import java.util.*;

public class BinaryTree {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }
    Node root;

    public void insertLevelOrder(int val) {
        Node newNode = new Node(val);
        if (root == null) { root = newNode; return; }
        Queue<Node> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            Node curr = q.poll();
            if (curr.left == null) { curr.left = newNode; return; }
            q.add(curr.left);
            if (curr.right == null) { curr.right = newNode; return; }
            q.add(curr.right);
        }
    }
}`
  },

  bst_ds: {
    id: 'bst_ds',
    name: 'Binary Search Tree (BST)',
    category: 'data_structures',
    tag: 'ORDERED DICHOTOMY',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(n) Skewed',
    spaceComplexity: 'O(n)',
    description: 'Ordered binary tree enforcing the BST invariant: LeftSubtree(x) < x < RightSubtree(x). Enables logarithmic search and in-order sorted traversal. Handles 3 deletion cases (leaf, 1-child, 2-child successor swap).',
    mathFormula: '\\forall u \\in \\text{Left}(x): \\text{val}(u) < \\text{val}(x) \\quad \\land \\quad \\forall v \\in \\text{Right}(x): \\text{val}(v) > \\text{val}(x)',
    pseudoCode: `function insertBST(node, val)
    if node is null then return createNode(val)
    if val < node.val then
        node.left = insertBST(node.left, val)
    else if val > node.val then
        node.right = insertBST(node.right, val)
    return node
end function

function deleteBST(node, val)
    if node is null then return null
    if val < node.val then node.left = deleteBST(node.left, val)
    else if val > node.val then node.right = deleteBST(node.right, val)
    else
        if node.left is null then return node.right
        if node.right is null then return node.left
        succ = findMin(node.right)
        node.val = succ.val
        node.right = deleteBST(node.right, succ.val)
    return node
end function`,
    pythonCode: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinarySearchTree:
    def insert(self, root, val):
        if not root: return BSTNode(val)
        if val < root.val: root.left = self.insert(root.left, val)
        elif val > root.val: root.right = self.insert(root.right, val)
        return root

    def search(self, root, target):
        if not root or root.val == target: return root
        if target < root.val: return self.search(root.left, target)
        return self.search(root.right, target)

    def delete(self, root, val):
        if not root: return None
        if val < root.val: root.left = self.delete(root.left, val)
        elif val > root.val: root.right = self.delete(root.right, val)
        else:
            if not root.left: return root.right
            if not root.right: return root.left
            succ = root.right
            while succ.left: succ = succ.left
            root.val = succ.val
            root.right = self.delete(root.right, succ.val)
        return root`,
    cppCode: `struct BSTNode {
    int val;
    BSTNode *left = nullptr, *right = nullptr;
    BSTNode(int v) : val(v) {}
};

class BST {
public:
    BSTNode* insert(BSTNode* node, int val) {
        if (!node) return new BSTNode(val);
        if (val < node->val) node->left = insert(node->left, val);
        else if (val > node->val) node->right = insert(node->right, val);
        return node;
    }
    BSTNode* search(BSTNode* node, int target) {
        if (!node || node->val == target) return node;
        return target < node->val ? search(node->left, target) : search(node->right, target);
    }
};`,
    javaCode: `public class BST {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }
    public Node insert(Node node, int val) {
        if (node == null) return new Node(val);
        if (val < node.val) node.left = insert(node.left, val);
        else if (val > node.val) node.right = insert(node.right, val);
        return node;
    }
}`
  },

  avl_ds: {
    id: 'avl_ds',
    name: 'AVL Self-Balancing Tree',
    category: 'data_structures',
    tag: 'HEIGHT BALANCED BST',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Strictly height-balanced BST named after Adelson-Velsky and Landis. Maintains balance factor |BF| <= 1 at every node, triggering LL (Right), RR (Left), LR, and RL rotations immediately upon violation.',
    mathFormula: '\\text{Balance Factor}(N) = h(N.\\text{left}) - h(N.\\text{right}) \\in \\{-1, 0, 1\\}, \\quad h(N) = 1 + \\max(h_L, h_R)',
    pseudoCode: `function rightRotate(y)
    x = y.left; T2 = x.right
    x.right = y; y.left = T2
    y.height = max(height(y.left), height(y.right)) + 1
    x.height = max(height(x.left), height(x.right)) + 1
    return x
end function

function leftRotate(x)
    y = x.right; T2 = y.left
    y.left = x; x.right = T2
    x.height = max(height(x.left), height(x.right)) + 1
    y.height = max(height(y.left), height(y.right)) + 1
    return y
end function`,
    pythonCode: `class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def height(self, node): return node.height if node else 0
    def bf(self, node): return self.height(node.left) - self.height(node.right) if node else 0

    def rotate_right(self, y):
        x = y.left; T2 = x.right
        x.right = y; y.left = T2
        y.height = 1 + max(self.height(y.left), self.height(y.right))
        x.height = 1 + max(self.height(x.left), self.height(x.right))
        return x

    def rotate_left(self, x):
        y = x.right; T2 = y.left
        y.left = x; x.right = T2
        x.height = 1 + max(self.height(x.left), self.height(x.right))
        y.height = 1 + max(self.height(y.left), self.height(y.right))
        return y

    def insert(self, root, key):
        if not root: return AVLNode(key)
        if key < root.key: root.left = self.insert(root.left, key)
        elif key > root.key: root.right = self.insert(root.right, key)
        else: return root

        root.height = 1 + max(self.height(root.left), self.height(root.right))
        balance = self.bf(root)

        # LL Case
        if balance > 1 and key < root.left.key: return self.rotate_right(root)
        # RR Case
        if balance < -1 and key > root.right.key: return self.rotate_left(root)
        # LR Case
        if balance > 1 and key > root.left.key:
            root.left = self.rotate_left(root.left)
            return self.rotate_right(root)
        # RL Case
        if balance < -1 and key < root.right.key:
            root.right = self.rotate_right(root.right)
            return self.rotate_left(root)
        return root`,
    cppCode: `struct AVLNode {
    int key, height = 1;
    AVLNode *left = nullptr, *right = nullptr;
    AVLNode(int k) : key(k) {}
};`,
    javaCode: `public class AVLTree {
    static class Node {
        int key, height = 1;
        Node left, right;
        Node(int k) { key = k; }
    }
}`
  },

  bst_avl: {
    id: 'bst_avl',
    name: 'BST & AVL Balanced Trees',
    category: 'data_structures',
    tag: 'SELF-BALANCING BST',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Strictly height-balanced BST where child subtree heights differ by at most 1 (|BF| <= 1). Restores balance via LL, RR, LR, RL tree rotations on insertions/deletions.',
    mathFormula: '\\text{Balance Factor}(N) = \\text{height}(N.\\text{left}) - \\text{height}(N.\\text{right}) \\in \\{-1, 0, 1\\}',
    pseudoCode: `function rightRotate(y)
    x = y.left; T2 = x.right
    x.right = y; y.left = T2
    updateHeights(y, x)
    return x
end function`,
    pythonCode: `class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1`,
    cppCode: `struct Node {
    int key, height;
    Node *left, *right;
    Node(int k) : key(k), height(1), left(nullptr), right(nullptr) {}
};`,
    javaCode: `class Node {
    int key, height = 1;
    Node left, right;
    Node(int d) { key = d; }
}`
  },

  rbtree_ds: {
    id: 'rbtree_ds',
    name: 'Red-Black Balanced Tree',
    category: 'data_structures',
    tag: 'COLOR INVARIANT BST',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Self-balancing BST using node color invariants (Red/Black). Guarantees that the longest path from root to leaf is no more than twice the shortest path via 5 fundamental invariants, minimizing tree rotations.',
    mathFormula: '\\text{Height}(T) \\le 2 \\log_2(N + 1), \\quad \\text{Black-Height}(N) = \\text{const on all paths to NULL}',
    pseudoCode: `// 5 Red-Black Invariants:
// 1. Every node is RED or BLACK.
// 2. Root is always BLACK.
// 3. All leaves (NIL nodes) are BLACK.
// 4. Red node cannot have Red children (No double red).
// 5. Every simple path from a node to descendant leaves has equal Black-Height.`,
    pythonCode: `class RBNode:
    def __init__(self, val, color="RED"):
        self.val = val
        self.color = color
        self.left = None
        self.right = None
        self.parent = None`,
    cppCode: `enum Color { RED, BLACK };
struct RBNode {
    int data;
    Color color;
    RBNode *left, *right, *parent;
    RBNode(int v) : data(v), color(RED), left(nullptr), right(nullptr), parent(nullptr) {}
};`,
    javaCode: `class RBNode {
    int data;
    boolean isRed;
    RBNode left, right, parent;
    RBNode(int d) { data = d; isRed = true; }
}`
  },

  red_black: {
    id: 'red_black',
    name: 'Red-Black Tree',
    category: 'data_structures',
    tag: 'ISOMETRIC 2-3-4',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Self-balancing BST with 1-bit color flag per node. Guarantees that no path from root to leaf is more than twice as long as any other path via 5 fundamental RB invariants.',
    mathFormula: '\\text{Black-Height}(N) = \\text{constant on all paths to NULL leaves}',
    pseudoCode: `// 1. Every node is either RED or BLACK
// 2. Root is always BLACK
// 3. Red nodes cannot have Red children (No double red)
// 4. Every path from node to NULL leaf contains same count of Black nodes`,
    pythonCode: `class RBNode:
    def __init__(self, val, color="RED"):
        self.val = val
        self.color = color
        self.left = None
        self.right = None
        self.parent = None`,
    cppCode: `enum Color { RED, BLACK };
struct Node {
    int data;
    Color color;
    Node *left, *right, *parent;
};`,
    javaCode: `class RBNode {
    int data;
    boolean isRed;
    RBNode left, right, parent;
}`
  },

  segment_tree_ds: {
    id: 'segment_tree_ds',
    name: 'Segment Tree (Range Queries)',
    category: 'data_structures',
    tag: 'INTERVAL DECOMPOSITION',
    timeComplexityBest: 'O(log n) Query / Update',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(4n)',
    description: 'Binary tree storing interval summaries [L, R] over a 1D array. Evaluates associative range queries (Range Sum, Range Minimum Query / RMQ, Range Max) in O(log n) time and supports point updates with upward bubble propagation in O(log n).',
    mathFormula: 'T_{\\text{build}}(n) = O(n), \\quad T_{\\text{query}}(n) = O(\\log n), \\quad T_{\\text{update}}(n) = O(\\log n), \\quad \\text{Space} = O(4n)',
    pseudoCode: `procedure build(node, L, R, A)
    if L == R then
        tree[node] = A[L]
        return
    mid = (L + R) / 2
    build(2*node, L, mid, A)
    build(2*node+1, mid+1, R, A)
    tree[node] = tree[2*node] + tree[2*node+1]
end procedure

function query(node, L, R, QL, QR)
    if QL <= L and R <= QR then return tree[node] // Total overlap
    if R < QL or L > QR then return 0            // No overlap
    mid = (L + R) / 2
    return query(2*node, L, mid, QL, QR) + query(2*node+1, mid+1, R, QL, QR)
end function`,
    pythonCode: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(0, 0, self.n - 1, arr)

    def build(self, node, l, r, arr):
        if l == r:
            self.tree[node] = arr[l]
            return
        mid = (l + r) // 2
        self.build(2 * node + 1, l, mid, arr)
        self.build(2 * node + 2, mid + 1, r, arr)
        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]

    def query(self, node, l, r, ql, qr):
        if ql <= l and r <= qr: return self.tree[node]
        if r < ql or l > qr: return 0
        mid = (l + r) // 2
        return self.query(2 * node + 1, l, mid, ql, qr) + self.query(2 * node + 2, mid + 1, r, ql, qr)

    def update(self, node, l, r, idx, val):
        if l == r:
            self.tree[node] = val
            return
        mid = (l + r) // 2
        if idx <= mid: self.update(2 * node + 1, l, mid, idx, val)
        else: self.update(2 * node + 2, mid + 1, r, idx, val)
        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]`,
    cppCode: `#include <vector>
using namespace std;

class SegmentTree {
    vector<int> tree;
    int n;
    void build(int node, int l, int r, const vector<int>& arr) {
        if (l == r) { tree[node] = arr[l]; return; }
        int mid = (l + r) / 2;
        build(2 * node, l, mid, arr);
        build(2 * node + 1, mid + 1, r, arr);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
public:
    SegmentTree(const vector<int>& arr) {
        n = arr.size();
        tree.resize(4 * n);
        build(1, 0, n - 1, arr);
    }
};`,
    javaCode: `public class SegmentTree {
    private int[] tree;
    private int n;
    public SegmentTree(int[] arr) {
        n = arr.length;
        tree = new int[4 * n];
        build(1, 0, n - 1, arr);
    }
    private void build(int node, int l, int r, int[] arr) {
        if (l == r) { tree[node] = arr[l]; return; }
        int mid = (l + r) / 2;
        build(2 * node, l, mid, arr);
        build(2 * node + 1, mid + 1, r, arr);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}`
  },

  heap_ds: {
    id: 'heap_ds',
    name: 'Binary Heap (Priority Queue)',
    category: 'data_structures',
    tag: 'COMPLETE TREE ARRAY',
    timeComplexityBest: 'O(1) Peek Root',
    timeComplexityAverage: 'O(log n) Insert / Extract',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Complete binary tree packed tightly into a flat contiguous 1D array. Parent = ⌊(i-1)/2⌋, Left = 2i+1, Right = 2i+2. Provides O(log n) priority queue insertion and root extraction.',
    mathFormula: '\\text{Parent}(i) = \\left\\lfloor \\frac{i-1}{2} \\right\\rfloor, \\quad \\text{Left}(i) = 2i + 1, \\quad \\text{Right}(i) = 2i + 2',
    pseudoCode: `procedure bubbleUp(A, i)
    while i > 0 and A[i] < A[parent(i)] do
        swap(A[i], A[parent(i)])
        i = parent(i)
    end while
end procedure`,
    pythonCode: `import heapq

class MinHeap:
    def __init__(self):
        self.heap = []
    def push(self, val):
        heapq.heappush(self.heap, val)
    def pop(self):
        return heapq.heappop(self.heap)`,
    cppCode: `#include <queue>
priority_queue<int, vector<int>, greater<int>> minHeap;`,
    javaCode: `import java.util.PriorityQueue;
PriorityQueue<Integer> minHeap = new PriorityQueue<>();`
  },

  trie_ds: {
    id: 'trie_ds',
    name: 'Trie (26-Ary Prefix Tree)',
    category: 'data_structures',
    tag: 'PREFIX RETRIEVAL',
    timeComplexityBest: 'O(L) Length of Word',
    timeComplexityAverage: 'O(L)',
    timeComplexityWorst: 'O(L)',
    spaceComplexity: 'O(26^L)',
    description: 'Multi-way tree where each node represents a character transition. Enables O(L) prefix autocomplete and dictionary word validation without hashing collisions.',
    mathFormula: 'T(L) = O(L) \\quad \\text{where } L = \\text{length of string}',
    pseudoCode: `class TrieNode:
    children = array of size 26
    isEndOfWord = false`,
    pythonCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        curr = self.root
        for c in word:
            curr = curr.children.setdefault(c, TrieNode())
        curr.is_end = True`,
    cppCode: `struct TrieNode {
    TrieNode* children[26] = {};
    bool isEnd = false;
};`,
    javaCode: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd;
}`
  },

  b_tree_ds: {
    id: 'b_tree_ds',
    name: 'B-Tree (2-3-4 Multi-Way Tree)',
    category: 'data_structures',
    tag: 'DISK & DATABASE INDEX',
    timeComplexityBest: 'O(log n)',
    timeComplexityAverage: 'O(log n)',
    timeComplexityWorst: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Self-balancing multi-way search tree optimized for database indices and block storage where each internal node contains multiple keys and pointers.',
    mathFormula: 'h \\le \\log_{\\lceil M/2 \\rceil} \\left( \\frac{N + 1}{2} \\right)',
    pseudoCode: `// 2-3-4 Tree: Nodes have 1, 2, or 3 keys, and 2, 3, or 4 children
// Splits 4-nodes preemptively on downward traversal`,
    pythonCode: `class BTreeNode:
    def __init__(self, leaf=True):
        self.leaf = leaf
        self.keys = []
        self.children = []`,
    cppCode: `struct BTreeNode {
    vector<int> keys;
    vector<BTreeNode*> children;
    bool leaf;
};`,
    javaCode: `class BTreeNode {
    int[] keys;
    BTreeNode[] children;
    boolean isLeaf;
}`
  },

  disjoint_set_ds: {
    id: 'disjoint_set_ds',
    name: 'Disjoint Sets (Union-Find)',
    category: 'data_structures',
    tag: 'NEAR O(1) INVERSE ACK.',
    timeComplexityBest: 'O(α(n)) ≈ O(1)',
    timeComplexityAverage: 'O(α(n))',
    timeComplexityWorst: 'O(α(n))',
    spaceComplexity: 'O(n)',
    description: 'Disjoint-set forest data structure with Path Compression and Union-by-Rank/Size, running in nearly constant amortized time α(n) (Inverse Ackermann).',
    mathFormula: 'T(m, n) = O(m \\cdot \\alpha(n)) \\quad \\text{where } \\alpha(n) \\le 4 \\text{ for all practical } n',
    pseudoCode: `function find(i)
    if parent[i] == i then return i
    parent[i] = find(parent[i]) // Path compression
    return parent[i]
end function`,
    pythonCode: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, i):
        if self.parent[i] == i: return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]
    def union(self, u, v):
        rU, rV = self.find(u), self.find(v)
        if rU != rV:
            if self.rank[rU] < self.rank[rV]: self.parent[rU] = rV
            elif self.rank[rU] > self.rank[rV]: self.parent[rV] = rU
            else: self.parent[rV] = rU; self.rank[rU] += 1`,
    cppCode: `struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i) {
        return parent[i] == i ? i : (parent[i] = find(parent[i]));
    }
    void unite(int u, int v) {
        int rU = find(u), rV = find(v);
        if (rU != rV) {
            if (rank[rU] < rank[rV]) parent[rU] = rV;
            else if (rank[rU] > rank[rV]) parent[rV] = rU;
            else { parent[rV] = rU; rank[rU]++; }
        }
    }
};`,
    javaCode: `public class DSU {
    private int[] parent, rank;
    public DSU(int n) {
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int find(int i) {
        return parent[i] == i ? i : (parent[i] = find(parent[i]));
    }
    public void union(int u, int v) {
        int rU = find(u), rV = find(v);
        if (rU != rV) {
            if (rank[rU] < rank[rV]) parent[rU] = rV;
            else if (rank[rU] > rank[rV]) parent[rV] = rU;
            else { parent[rV] = rU; rank[rU]++; }
        }
    }
}`
  },

  // --- 4. GRAPH ALGORITHMS ---
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    category: 'graph',
    tag: 'GREEDY RELAXATION',
    timeComplexityBest: 'O((V + E) log V)',
    timeComplexityAverage: 'O((V + E) log V)',
    timeComplexityWorst: 'O(V²)',
    spaceComplexity: 'O(V)',
    description: 'Finds the single-source shortest path in a weighted graph with non-negative edge weights using greedy priority queue relaxation.',
    mathFormula: '\\text{if } d[u] + w(u, v) < d[v] \\implies d[v] \\leftarrow d[u] + w(u, v)',
    pseudoCode: `procedure dijkstra(G, source)
    for each vertex v in G do dist[v] = infinity
    dist[source] = 0
    PQ.push((0, source))
    while PQ is not empty do
        (d, u) = PQ.pop()
        for each neighbor v of u with weight w do
            if dist[u] + w < dist[v] then
                dist[v] = dist[u] + w
                PQ.push((dist[v], v))
            end if
        end for
    end while
end procedure`,
    pythonCode: `import heapq
def dijkstra(graph, start):
    dist = {v: float('inf') for v in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    cppCode: `vector<int> dijkstra(int V, vector<vector<pair<int,int>>>& adj, int S) {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    vector<int> dist(V, 1e9);
    dist[S] = 0;
    pq.push({0, S});
    while (!pq.empty()) {
        int d = pq.top().first, u = pq.top().second; pq.pop();
        if (d > dist[u]) continue;
        for (auto& edge : adj[u]) {
            int v = edge.first, w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    javaCode: `public int[] dijkstra(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int S) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[S] = 0;
    pq.add(new int[]{0, S});
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];
        if (d > dist[u]) continue;
        for (ArrayList<Integer> edge : adj.get(u)) {
            int v = edge.get(0), w = edge.get(1);
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.add(new int[]{dist[v], v});
            }
        }
    }
    return dist;
}`
  },

  bfs_dfs: {
    id: 'bfs_dfs',
    name: 'Graph Traversal (BFS & DFS)',
    category: 'graph',
    tag: 'EXPLORATION',
    timeComplexityBest: 'O(V + E)',
    timeComplexityAverage: 'O(V + E)',
    timeComplexityWorst: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'BFS explores graph level-by-level using a FIFO Queue. DFS explores deep along each branch using recursion or a LIFO Stack.',
    mathFormula: 'T(V, E) = \\Theta(|V| + |E|), \\quad S(V) = O(|V|)',
    pseudoCode: `procedure BFS(G, root):
    Q = Queue(); visited = set()
    Q.push(root); visited.add(root)
    while Q not empty:
        u = Q.pop()
        for v in G.neighbors(u):
            if v not in visited:
                visited.add(v); Q.push(v)

procedure DFS(G, u, visited):
    visited.add(u)
    for v in G.neighbors(u):
        if v not in visited: DFS(G, v, visited)`,
    pythonCode: `from collections import deque

def bfs(graph, start):
    visited, q = {start}, deque([start])
    order = []
    while q:
        u = q.popleft(); order.append(u)
        for v in graph[u]:
            if v not in visited:
                visited.add(v); q.append(v)
    return order`,
    cppCode: `void bfs(int start, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[start] = true; q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
    javaCode: `void bfs(int start, List<List<Integer>> adj) {
    boolean[] visited = new boolean[adj.size()];
    Queue<Integer> q = new LinkedList<>();
    visited[start] = true; q.add(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : adj.get(u)) {
            if (!visited[v]) { visited[v] = true; q.add(v); }
        }
    }
}`
  },

  // --- 5. DYNAMIC PROGRAMMING ---
  knapsack_01: {
    id: 'knapsack_01',
    name: '0/1 Knapsack Problem',
    category: 'dp',
    tag: 'TABLE FILL',
    timeComplexityBest: 'O(n · W)',
    timeComplexityAverage: 'O(n · W)',
    timeComplexityWorst: 'O(n · W)',
    spaceComplexity: 'O(n · W) or O(W)',
    description: 'Given weights and values of n items, puts items in a knapsack of capacity W to maximize total value without item splitting.',
    mathFormula: 'DP[i][w] = \\begin{cases} DP[i-1][w] & \\text{if } wt[i-1] > w \\\\ \\max(DP[i-1][w], \\, DP[i-1][w - wt[i-1]] + val[i-1]) & \\text{otherwise} \\end{cases}',
    pseudoCode: `function knapsack(W, wt, val, n)
    create table DP[n+1][W+1] = 0
    for i = 1 to n do
        for w = 1 to W do
            if wt[i-1] <= w then
                DP[i][w] = max(val[i-1] + DP[i-1][w - wt[i-1]], DP[i-1][w])
            else
                DP[i][w] = DP[i-1][w]
            end if
        end for
    end for
    return DP[n][W]
end function`,
    pythonCode: `def knapsack_01(W, wt, val, n):
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if wt[i - 1] <= w:
                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][W]`,
    cppCode: `int knapsack(int W, const vector<int>& wt, const vector<int>& val, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i-1] <= w)
                dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}`,
    javaCode: `static int knapSack(int W, int wt[], int val[], int n) {
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i-1] <= w)
                dp[i][w] = Math.max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}`
  },

  lcs_dp: {
    id: 'lcs_dp',
    name: 'Longest Common Subsequence (LCS)',
    category: 'dp',
    tag: '2D MATRIX',
    timeComplexityBest: 'O(m · n)',
    timeComplexityAverage: 'O(m · n)',
    timeComplexityWorst: 'O(m · n)',
    spaceComplexity: 'O(m · n)',
    description: 'Finds the length of the longest subsequence present in both strings X[0..m-1] and Y[0..n-1] in the same relative order.',
    mathFormula: 'L[i][j] = \\begin{cases} 0 & i=0 \\lor j=0 \\\\ 1 + L[i-1][j-1] & X[i-1] = Y[j-1] \\\\ \\max(L[i-1][j], L[i][j-1]) & X[i-1] \\ne Y[j-1] \\end{cases}',
    pseudoCode: `function LCS(X, Y)
    m = length(X), n = length(Y)
    DP[m+1][n+1] = 0
    for i = 1 to m do
        for j = 1 to n do
            if X[i-1] == Y[j-1] then DP[i][j] = DP[i-1][j-1] + 1
            else DP[i][j] = max(DP[i-1][j], DP[i][j-1])
        end for
    end for
    return DP[m][n]
end function`,
    pythonCode: `def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i - 1] == Y[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    cppCode: `int lcs(string X, string Y) {
    int m = X.size(), n = Y.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X[i-1] == Y[j-1]) dp[i][j] = 1 + dp[i-1][j-1];
            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`,
    javaCode: `int lcs(char[] X, char[] Y, int m, int n) {
    int L[][] = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) L[i][j] = 0;
            else if (X[i - 1] == Y[j - 1]) L[i][j] = L[i - 1][j - 1] + 1;
            else L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);
        }
    }
    return L[m][n];
}`
  },

  // --- 6. BACKTRACKING ---
  n_queens: {
    id: 'n_queens',
    name: 'N-Queens Backtracking Problem',
    category: 'backtracking',
    tag: 'STATE SPACE',
    timeComplexityBest: 'O(N!)',
    timeComplexityAverage: 'O(N!)',
    timeComplexityWorst: 'O(N!)',
    spaceComplexity: 'O(N²)',
    description: 'Places N non-attacking queens on an N×N chessboard using recursive depth-first state-space search with row, column, and diagonal conflict pruning.',
    mathFormula: '\\forall (r_1, c_1), (r_2, c_2): \\, c_1 \\ne c_2 \\land |r_1 - r_2| \\ne |c_1 - c_2|',
    pseudoCode: `procedure solveNQueens(board, row, N)
    if row == N then recordSolution(board); return
    for col = 0 to N - 1 do
        if isSafe(board, row, col) then
            placeQueen(board, row, col)
            solveNQueens(board, row + 1, N)
            removeQueen(board, row, col) // backtrack
        end if
    end for
end procedure`,
    pythonCode: `def solve_n_queens(n):
    board = [['.'] * n for _ in range(n)]
    res = []
    cols, diag1, diag2 = set(), set(), set()
    def backtrack(r):
        if r == n:
            res.append(["".join(row) for row in board]); return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2: continue
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            board[r][c] = 'Q'
            backtrack(r + 1)
            board[r][c] = '.'
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
    backtrack(0)
    return res`,
    cppCode: `bool isSafe(vector<string>& board, int row, int col, int n) {
    for (int i = 0; i < row; i++) if (board[i][col] == 'Q') return false;
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j] == 'Q') return false;
    for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j] == 'Q') return false;
    return true;
}`,
    javaCode: `boolean solveNQUtil(int board[][], int col, int N) {
    if (col >= N) return true;
    for (int i = 0; i < N; i++) {
        if (isSafe(board, i, col, N)) {
            board[i][col] = 1;
            if (solveNQUtil(board, col + 1, N)) return true;
            board[i][col] = 0; // BACKTRACK
        }
    }
    return false;
}`
  },

  // --- 7. GREEDY & STRINGS ---
  kmp_string_matching: {
    id: 'kmp_string_matching',
    name: 'Knuth-Morris-Pratt (KMP) Pattern Matching',
    category: 'greedy_strings',
    tag: 'PREFIX FUNCTION',
    timeComplexityBest: 'O(N + M)',
    timeComplexityAverage: 'O(N + M)',
    timeComplexityWorst: 'O(N + M)',
    spaceComplexity: 'O(M)',
    description: 'Searches for occurrences of a pattern P in text T in linear time by precomputing the Longest Proper Prefix which is also Suffix (LPS / π table) to avoid redundant comparisons.',
    mathFormula: '\\pi[i] = \\max \\{ k : P[0..k-1] \\text{ is a suffix of } P[0..i] \\}',
    pseudoCode: `procedure computeLPSArray(P, M, lps)
    len = 0; lps[0] = 0; i = 1
    while i < M do
        if P[i] == P[len] then len++; lps[i] = len; i++
        else if len != 0 then len = lps[len - 1]
        else lps[i] = 0; i++
    end while
end procedure`,
    pythonCode: `def compute_lps(pattern):
    lps = [0] * len(pattern)
    length, i = 0, 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    return lps`,
    cppCode: `vector<int> computeLPS(string pat) {
    int m = pat.size(), len = 0, i = 1;
    vector<int> lps(m, 0);
    while (i < m) {
        if (pat[i] == pat[len]) lps[i++] = ++len;
        else if (len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    return lps;
}`,
    javaCode: `void computeLPSArray(String pat, int M, int lps[]) {
    int len = 0, i = 1;
    lps[0] = 0;
    while (i < M) {
        if (pat.charAt(i) == pat.charAt(len)) {
            len++; lps[i] = len; i++;
        } else {
            if (len != 0) len = lps[len - 1];
            else { lps[i] = 0; i++; }
        }
    }
}`
  },
  kruskals_mst: {
    id: 'kruskals_mst',
    name: "Kruskal's Minimum Spanning Tree",
    category: 'graph',
    tag: 'GREEDY MST',
    timeComplexityBest: 'O(E log E)',
    timeComplexityAverage: 'O(E log E)',
    timeComplexityWorst: 'O(E log E)',
    spaceComplexity: 'O(V + E)',
    description: 'Sorts all edges in ascending order of weights and greedily adds edges to the spanning forest if they do not create a cycle using Union-Find.',
    mathFormula: 'T(E, V) = O(E \\log E + E \\cdot \\alpha(V)) = O(E \\log E)',
    pseudoCode: `procedure kruskal(G):
    A = empty set
    for each edge (u, v) ordered by weight:
        if find(u) != find(v):
            A.add((u, v))
            union(u, v)
    return A`,
    pythonCode: `def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    parent = list(range(n))
    mst = []
    for u, v, w in edges:
        if find(parent, u) != find(parent, v):
            union(parent, u, v)
            mst.append((u, v, w))
    return mst`,
    cppCode: `vector<Edge> kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    vector<int> parent(n); iota(parent.begin(), parent.end(), 0);
    vector<Edge> mst;
    for (auto& e : edges) {
        if (find(parent, e.u) != find(parent, e.v)) {
            unionSet(parent, e.u, e.v);
            mst.push_back(e);
        }
    }
    return mst;
}`,
    javaCode: `List<Edge> kruskal(int n, List<Edge> edges) {
    Collections.sort(edges);
    int[] parent = new int[n]; for(int i=0; i<n; i++) parent[i] = i;
    List<Edge> mst = new ArrayList<>();
    for (Edge e : edges) {
        if (find(parent, e.u) != find(parent, e.v)) {
            union(parent, e.u, e.v);
            mst.add(e);
        }
    }
    return mst;
}`
  },

  floyd_warshall: {
    id: 'floyd_warshall',
    name: 'Floyd-Warshall (All-Pairs Shortest Path)',
    category: 'graph',
    tag: 'ALL-PAIRS 2D DP',
    timeComplexityBest: 'O(V³)',
    timeComplexityAverage: 'O(V³)',
    timeComplexityWorst: 'O(V³)',
    spaceComplexity: 'O(V²)',
    description: 'Dynamic programming matrix algorithm that computes shortest distances between all pairs of vertices in a weighted directed/undirected graph.',
    mathFormula: 'D^{(k)}[i][j] = \\min \\left( D^{(k-1)}[i][j], \\; D^{(k-1)}[i][k] + D^{(k-1)}[k][j] \\right)',
    pseudoCode: `procedure floydWarshall(W, V):
    D = W
    for k = 1 to V:
        for i = 1 to V:
            for j = 1 to V:
                D[i][j] = min(D[i][j], D[i][k] + D[k][j])
    return D`,
    pythonCode: `def floyd_warshall(graph, V):
    dist = [row[:] for row in graph]
    for k in range(V):
        for i in range(V):
            for j in range(V):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist`,
    cppCode: `void floydWarshall(vector<vector<int>>& dist, int V) {
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
            }
        }
    }
}`,
    javaCode: `void floydWarshall(int dist[][], int V) {
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
            }
        }
    }
}`
  },

  topo_sort: {
    id: 'topo_sort',
    name: "Topological Sort (Kahn's Indegree Algorithm)",
    category: 'graph',
    tag: 'DAG ORDERING',
    timeComplexityBest: 'O(V + E)',
    timeComplexityAverage: 'O(V + E)',
    timeComplexityWorst: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge (u, v), vertex u comes before v.',
    mathFormula: '\\text{DAG} \\implies \\exists \\text{ vertex } v \\text{ with } \\text{in-degree}(v) = 0',
    pseudoCode: `procedure kahn(G):
    compute inDegrees
    queue = [v for v in G if inDegree[v] == 0]
    while queue is not empty:
        u = queue.pop()
        order.append(u)
        for each neighbor v of u:
            inDegree[v]--
            if inDegree[v] == 0: queue.push(v)`,
    pythonCode: `from collections import deque
def kahn_topo_sort(V, adj):
    in_deg = [0] * V
    for u in range(V):
        for v in adj[u]: in_deg[v] += 1
    q = deque([i for i in range(V) if in_deg[i] == 0])
    res = []
    while q:
        u = q.popleft(); res.append(u)
        for v in adj[u]:
            in_deg[v] -= 1
            if in_deg[v] == 0: q.append(v)
    return res`,
    cppCode: `vector<int> topoSort(int V, vector<vector<int>>& adj) {
    vector<int> in_degree(V, 0);
    for (int i = 0; i < V; i++) for (int v : adj[i]) in_degree[v]++;
    queue<int> q; for (int i = 0; i < V; i++) if (in_degree[i] == 0) q.push(i);
    vector<int> topo;
    while (!q.empty()) {
        int u = q.front(); q.pop(); topo.push_back(u);
        for (int v : adj[u]) if (--in_degree[v] == 0) q.push(v);
    }
    return topo;
}`,
    javaCode: `int[] topoSort(int V, ArrayList<ArrayList<Integer>> adj) {
    int in_degree[] = new int[V];
    for (int i = 0; i < V; i++) for (int v : adj.get(i)) in_degree[v]++;
    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < V; i++) if (in_degree[i] == 0) q.add(i);
    int[] topo = new int[V]; int idx = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); topo[idx++] = u;
        for (int v : adj.get(u)) if (--in_degree[v] == 0) q.add(v);
    }
    return topo;
}`
  },

  knapsack: {
    id: 'knapsack',
    name: '0/1 Knapsack Problem',
    category: 'dp',
    tag: '2D DP MATRIX',
    timeComplexityBest: 'O(N * W)',
    timeComplexityAverage: 'O(N * W)',
    timeComplexityWorst: 'O(N * W)',
    spaceComplexity: 'O(N * W)',
    description: 'Given items with weights and values, determines the maximum value subset fitting within knapsack capacity W.',
    mathFormula: 'DP[i][w] = \\max \\left( v_i + DP[i-1][w - w_i], \\; DP[i-1][w] \\right)',
    pseudoCode: `function knapsack(W, wt, val, n):
    for i = 1 to n:
        for w = 1 to W:
            if wt[i-1] <= w then
                dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w])
            else: dp[i][w] = dp[i-1][w]`,
    pythonCode: `def knapsack(W, wt, val, n):
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(1, W+1):
            if wt[i-1] <= w:
                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w])
            else: dp[i][w] = dp[i-1][w]
    return dp[n][W]`,
    cppCode: `int knapSack(int W, int wt[], int val[], int n) {
    vector<vector<int>> K(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w)
                K[i][w] = max(val[i - 1] + K[i - 1][w - wt[i - 1]], K[i - 1][w]);
            else K[i][w] = K[i - 1][w];
        }
    }
    return K[n][W];
}`,
    javaCode: `int knapSack(int W, int wt[], int val[], int n) {
    int[][] K = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w)
                K[i][w] = Math.max(val[i - 1] + K[i - 1][w - wt[i - 1]], K[i - 1][w]);
            else K[i][w] = K[i - 1][w];
        }
    }
    return K[n][W];
}`
  },

  lcs: {
    id: 'lcs',
    name: 'Longest Common Subsequence (LCS)',
    category: 'dp',
    tag: '2D LETTER MATRIX',
    timeComplexityBest: 'O(M * N)',
    timeComplexityAverage: 'O(M * N)',
    timeComplexityWorst: 'O(M * N)',
    spaceComplexity: 'O(M * N)',
    description: 'Finds the length of the longest subsequence present in both strings in same relative order.',
    mathFormula: 'L[i][j] = \\begin{cases} 1 + L[i-1][j-1] & \\text{if } X[i-1] = Y[j-1] \\\\ \\max(L[i-1][j], L[i][j-1]) & \\text{otherwise} \\end{cases}',
    pseudoCode: `function lcs(X, Y, m, n):
    for i = 1 to m:
        for j = 1 to n:
            if X[i-1] == Y[j-1] then L[i][j] = 1 + L[i-1][j-1]
            else L[i][j] = max(L[i-1][j], L[i][j-1])`,
    pythonCode: `def lcs(X, Y):
    m, n = len(X), len(Y)
    L = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if X[i-1] == Y[j-1]: L[i][j] = L[i-1][j-1] + 1
            else: L[i][j] = max(L[i-1][j], L[i][j-1])
    return L[m][n]`,
    cppCode: `int lcs(string X, string Y) {
    int m = X.size(), n = Y.size();
    vector<vector<int>> L(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X[i - 1] == Y[j - 1]) L[i][j] = L[i - 1][j - 1] + 1;
            else L[i][j] = max(L[i - 1][j], L[i][j - 1]);
        }
    }
    return L[m][n];
}`,
    javaCode: `int lcs(char[] X, char[] Y, int m, int n) {
    int L[][] = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X[i - 1] == Y[j - 1]) L[i][j] = L[i - 1][j - 1] + 1;
            else L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);
        }
    }
    return L[m][n];
}`
  },

  coin_change: {
    id: 'coin_change',
    name: 'Making Change (Coin Change Problem)',
    category: 'dp',
    tag: '1D SUBPROBLEM',
    timeComplexityBest: 'O(Amount * N)',
    timeComplexityAverage: 'O(Amount * N)',
    timeComplexityWorst: 'O(Amount * N)',
    spaceComplexity: 'O(Amount)',
    description: 'Finds the minimum number of coins needed to make a given target amount using available denominations.',
    mathFormula: 'DP[A] = \\min_{c \\in \\text{coins}} \\left( 1 + DP[A - c] \\right), \\quad DP[0] = 0',
    pseudoCode: `function coinChange(coins, amount):
    dp = [0] + [infinity] * amount
    for a = 1 to amount:
        for c in coins:
            if a - c >= 0 then dp[a] = min(dp[a], 1 + dp[a - c])`,
    pythonCode: `def coin_change(coins, amount):
    dp = [0] + [float('inf')] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0: dp[a] = min(dp[a], 1 + dp[a - c])
    return dp[amount] if dp[amount] != float('inf') else -1`,
    cppCode: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, 1e9); dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a - c >= 0) dp[a] = min(dp[a], 1 + dp[a - c]);
        }
    }
    return dp[amount] > 1e8 ? -1 : dp[amount];
}`,
    javaCode: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) if (a - c >= 0) dp[a] = Math.min(dp[a], 1 + dp[a - c]);
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`
  },

  fibonacci: {
    id: 'fibonacci',
    name: 'Fibonacci (Memoization vs Tabulation)',
    category: 'dp',
    tag: 'OPTIMAL SUBSTRUCTURE',
    timeComplexityBest: 'O(n)',
    timeComplexityAverage: 'O(n)',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n) or O(1)',
    description: 'Demonstrates overlapping subproblems in recursion vs O(n) memoization / linear 1D DP tabulation.',
    mathFormula: 'F_n = F_{n-1} + F_{n-2}, \\quad F_0 = 0, F_1 = 1',
    pseudoCode: `function fib(n):
    dp[0] = 0; dp[1] = 1
    for i = 2 to n:
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
    pythonCode: `def fib(n):
    if n <= 1: return n
    dp = [0] * (n + 1); dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    cppCode: `int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1, c;
    for (int i = 2; i <= n; i++) { c = a + b; a = b; b = c; }
    return b;
}`,
    javaCode: `int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1, c;
    for (int i = 2; i <= n; i++) { c = a + b; a = b; b = c; }
    return b;
}`
  },

  // --- RECURSION VISUALIZER ---
  fibonacci_tree: {
    id: 'fibonacci_tree',
    name: 'Fibonacci Recursive Call Tree',
    category: 'recursion',
    tag: 'DIVIDE & CONQUER',
    timeComplexityBest: 'O(2ⁿ)',
    timeComplexityAverage: 'O(2ⁿ)',
    timeComplexityWorst: 'O(2ⁿ)',
    spaceComplexity: 'O(n) [Stack Depth]',
    description: 'Visualizes the exponential binary branching call tree f(n) -> f(n-1) + f(n-2) and the live call stack growth and unwinding.',
    mathFormula: 'T(n) = T(n-1) + T(n-2) + O(1) = O(\\phi^n), \\quad \\phi \\approx 1.618',
    pseudoCode: `function fib(n):
    if n <= 1:
        return n
    left = fib(n - 1)
    right = fib(n - 2)
    return left + right`,
    pythonCode: `def fib(n):
    if n <= 1:
        return n
    left = fib(n - 1)
    right = fib(n - 2)
    return left + right`,
    cppCode: `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
    javaCode: `public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`
  },

  factorial_tree: {
    id: 'factorial_tree',
    name: 'Factorial Linear Recursion',
    category: 'recursion',
    tag: 'LINEAR RECURSION',
    timeComplexityBest: 'O(n)',
    timeComplexityAverage: 'O(n)',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(n) [Stack Frames]',
    description: 'Demonstrates single-branch recursive activation frames pushing onto the stack until base case fact(1)=1 is reached.',
    mathFormula: 'n! = n \\times (n-1)!, \\quad 0! = 1',
    pseudoCode: `function fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)`,
    pythonCode: `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)`,
    cppCode: `long long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
    javaCode: `public long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`
  },

  // --- GRAPH ALGORITHMS ---
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graph',
    tag: 'QUEUE TRAVERSAL',
    timeComplexityBest: 'O(V + E)',
    timeComplexityAverage: 'O(V + E)',
    timeComplexityWorst: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explores graph vertices level by level using a FIFO Queue, finding the shortest unweighted path from source.',
    mathFormula: '\\text{Level}(v) = \\text{Level}(u) + 1, \\quad \\forall (u, v) \\in E',
    pseudoCode: `procedure BFS(G, root):
    let Q be a queue
    label root as visited; Q.enqueue(root)
    while Q is not empty:
        v = Q.dequeue()
        for all edges from v to w in G.adjacentEdges(v):
            if w is not labeled as visited:
                label w as visited; Q.enqueue(w)`,
    pythonCode: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        vertex = queue.popleft()
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    cppCode: `void bfs(int start, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
    javaCode: `public void bfs(int start, List<List<Integer>> adj) {
    boolean[] visited = new boolean[adj.size()];
    Queue<Integer> q = new LinkedList<>();
    visited[start] = true;
    q.add(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                visited[v] = true;
                q.add(v);
            }
        }
    }
}`
  },

  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'graph',
    tag: 'STACK / RECURSION',
    timeComplexityBest: 'O(V + E)',
    timeComplexityAverage: 'O(V + E)',
    timeComplexityWorst: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Dives as deep as possible down each branch before backtracking using a Call Stack / recursion.',
    mathFormula: '\\text{DFS}(u) \\implies \\forall v \\in \\text{Adj}[u], \\; \\text{if unvisited} \\to \\text{DFS}(v)',
    pseudoCode: `procedure DFS(G, v):
    label v as discovered
    for all directed edges from v to w in G.adjacentEdges(v) do
        if vertex w is not labeled as discovered then
            recursively call DFS(G, w)`,
    pythonCode: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited`,
    cppCode: `void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}`,
    javaCode: `public void dfs(int u, List<List<Integer>> adj, boolean[] visited) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}`
  },

  bellman_ford: {
    id: 'bellman_ford',
    name: 'Bellman-Ford Algorithm',
    category: 'graph',
    tag: 'NEGATIVE WEIGHTS',
    timeComplexityBest: 'O(E)',
    timeComplexityAverage: 'O(V · E)',
    timeComplexityWorst: 'O(V · E)',
    spaceComplexity: 'O(V)',
    description: 'Relaxes all E edges V-1 times to find single-source shortest paths, detecting negative-weight cycles.',
    mathFormula: 'd[v] = \\min(d[v], d[u] + w(u, v)) \\quad \\text{repeated } |V|-1 \\text{ times}',
    pseudoCode: `procedure BellmanFord(vertices, edges, source):
    distance[source] = 0
    for i = 1 to |vertices| - 1:
        for each edge (u, v) with weight w in edges:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w
    for each edge (u, v) with weight w in edges:
        if distance[u] + w < distance[v]:
            error "Graph contains a negative-weight cycle"`,
    pythonCode: `def bellman_ford(vertices, edges, src):
    dist = {v: float('inf') for v in vertices}
    dist[src] = 0
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("Negative weight cycle detected")
    return dist`,
    cppCode: `bool bellmanFord(int src, int V, vector<tuple<int,int,int>>& edges, vector<int>& dist) {
    dist.assign(V, 1e9); dist[src] = 0;
    for (int i = 1; i < V; i++) {
        for (auto& [u, v, w] : edges) {
            if (dist[u] != 1e9 && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    for (auto& [u, v, w] : edges) {
        if (dist[u] != 1e9 && dist[u] + w < dist[v]) return false; // Cycle
    }
    return true;
}`,
    javaCode: `public boolean bellmanFord(int src, int V, int[][] edges, int[] dist) {
    Arrays.fill(dist, Integer.MAX_VALUE / 2); dist[src] = 0;
    for (int i = 1; i < V; i++) {
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    for (int[] e : edges) {
        if (dist[e[0]] + e[2] < dist[e[1]]) return false;
    }
    return true;
}`
  },

  prims: {
    id: 'prims',
    name: "Prim's Minimum Spanning Tree",
    category: 'graph',
    tag: 'GREEDY CUT PROPERTY',
    timeComplexityBest: 'O(E log V)',
    timeComplexityAverage: 'O(E log V)',
    timeComplexityWorst: 'O(E log V)',
    spaceComplexity: 'O(V)',
    description: 'Grows a minimum spanning tree from an initial vertex by greedily adding the cheapest crossing cut edge.',
    mathFormula: 'e^* = \\arg\\min_{e=(u,v), u \\in S, v \\notin S} w(e)',
    pseudoCode: `procedure Prims(G, start):
    let Q be a min-priority queue of vertices
    for each vertex v in G: key[v] = infinity, parent[v] = null
    key[start] = 0; Q.build(G.vertices)
    while Q is not empty:
        u = Q.extractMin()
        for each neighbor v of u:
            if v in Q and weight(u,v) < key[v]:
                parent[v] = u; key[v] = weight(u,v)`,
    pythonCode: `import heapq

def prims(n, adj):
    visited = [False] * n
    pq = [(0, 0)] # (weight, node)
    mst_cost = 0
    while pq:
        w, u = heapq.heappop(pq)
        if visited[u]: continue
        visited[u] = True
        mst_cost += w
        for v, weight in adj[u]:
            if not visited[v]:
                heapq.heappush(pq, (weight, v))
    return mst_cost`,
    cppCode: `int prims(int n, vector<vector<pair<int, int>>>& adj) {
    vector<bool> visited(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    pq.push({0, 0});
    int mstCost = 0;
    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (visited[u]) continue;
        visited[u] = true;
        mstCost += w;
        for (auto& [v, weight] : adj[u]) {
            if (!visited[v]) pq.push({weight, v});
        }
    }
    return mstCost;
}`,
    javaCode: `public int prims(int n, List<List<int[]>> adj) {
    boolean[] visited = new boolean[n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.add(new int[]{0, 0});
    int mstCost = 0;
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int w = top[0], u = top[1];
        if (visited[u]) continue;
        visited[u] = true;
        mstCost += w;
        for (int[] edge : adj.get(u)) {
            if (!visited[edge[0]]) pq.add(new int[]{edge[1], edge[0]});
        }
    }
    return mstCost;
}`
  },

  // --- SEARCHING ---
  linear_search: {
    id: 'linear_search',
    name: 'Linear Search',
    category: 'searching',
    tag: 'SEQUENTIAL SCAN',
    timeComplexityBest: 'O(1)',
    timeComplexityAverage: 'O(n)',
    timeComplexityWorst: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
    mathFormula: 'T(n) = \\sum_{i=1}^n P(x = A[i]) \\cdot i = \\frac{n+1}{2} = O(n)',
    pseudoCode: `function linearSearch(arr, target):
    for i = 0 to length(arr) - 1:
        if arr[i] == target:
            return i
    return -1`,
    pythonCode: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
    cppCode: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    javaCode: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
  }
};

