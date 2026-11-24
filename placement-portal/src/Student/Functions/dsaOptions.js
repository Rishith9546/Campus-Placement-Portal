export const DSA_TOPICS = [
  ["ARRAYS", "Arrays"], ["STRINGS", "Strings"], ["SORTING", "Sorting"],
  ["SEARCHING", "Searching"], ["BINARY_SEARCH", "Binary Search"], ["HASHING", "Hashing"],
  ["TWO_POINTERS", "Two Pointers"], ["SLIDING_WINDOW", "Sliding Window"],
  ["RECURSION", "Recursion"], ["BACKTRACKING", "Backtracking"],
  ["LINKED_LISTS", "Linked Lists"], ["STACK", "Stack"], ["QUEUE", "Queue"],
  ["TREES", "Trees"], ["BINARY_SEARCH_TREES", "Binary Search Trees"],
  ["HEAPS_PRIORITY_QUEUE", "Heaps / Priority Queue"], ["GRAPHS", "Graphs"],
  ["GREEDY", "Greedy"], ["DYNAMIC_PROGRAMMING", "Dynamic Programming"],
  ["BIT_MANIPULATION", "Bit Manipulation"], ["TRIES", "Tries"], ["OTHER", "Other"],
];

export const DSA_PLATFORMS = [
  ["LEETCODE", "LeetCode"], ["GEEKSFORGEEKS", "GeeksforGeeks"],
  ["CODEFORCES", "Codeforces"], ["HACKERRANK", "HackerRank"],
  ["CODECHEF", "CodeChef"], ["OTHER", "Other"],
];

export const DSA_DIFFICULTIES = [["EASY", "Easy"], ["MEDIUM", "Medium"], ["HARD", "Hard"]];
export const DSA_STATUSES = [["SOLVED", "Solved"], ["ATTEMPTED", "Attempted"], ["IN_PROGRESS", "In Progress"]];

const labels = Object.fromEntries([...DSA_TOPICS, ...DSA_PLATFORMS, ...DSA_DIFFICULTIES, ...DSA_STATUSES]);
export const dsaLabel = (value) => labels[value] || (value || "").replaceAll("_", " ");
