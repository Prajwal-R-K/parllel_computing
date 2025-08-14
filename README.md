# Parallel Computing Educational App – Matrix Addition Focus

## 📌 Project Overview
This is a **React-based educational application** designed to teach **parallel computing concepts** with a primary focus on **matrix addition**.  
It demonstrates and visualizes various parallel programming techniques using **code examples**, **detailed explanations**, and **interactive visual components**.

---

## 📂 Project Structure

### **Main Files**
- **`App.tsx`, `main.tsx`, `index.css`, `App.css`**  
  Standard React/Vite entry points and global styles.

---

### **Components**
- **`MatrixCodeAnalysis.tsx`** – Displays code examples for matrix addition:
  - Serial implementation
  - Parallel `for`
  - Sections
  - Element-based tasks
  - Row-based tasks  
  Includes performance analysis and explanations.
- **`MatrixAdditionExamples.tsx`, `MatrixVisualization.tsx`** – Interactive demos and visualizations of matrix operations.
- **`SerialVsParallelDemo.tsx`** – Compares serial vs parallel execution visually.
- **`ConceptsExplainer.tsx`, `ParallelismFundamentals.tsx`, `InternalProcessVisualization.tsx`** – Explain concepts and visualize how parallelism works internally.
- **`CodeExamples.tsx`** – Displays code snippets for different parallel approaches.

---

### **UI**
- Located in **`components/ui/`** – Contains reusable UI components (cards, tabs, buttons, etc.).

---

### **Hooks**
- **`hooks/`** – Custom React hooks, such as:
  - Mobile device detection
  - Toast notifications

---

### **Utilities**
- **`lib/utils.ts`** – Helper functions used across the application.

---

### **Pages**
- **`Index.tsx`** – Main landing page.
- **`NotFound.tsx`** – 404 error page.

---

## 🎯 What the App Does

### **Educational Focus**
- Teaches **parallel computing fundamentals** with real code examples.
- Covers **OpenMP** and **task-based parallelism** in C/C++.

### **Code Analysis**
- Side-by-side comparison of serial and parallel implementations.
- Explanation of pros, cons, and best use cases for each method.

### **Visualization**
- Interactive graphics showing:
  - How data is split
  - How tasks are executed
  - Thread assignments

### **User Interface**
- Clean, modern UI built with reusable components.
- Tabbed views, syntax-highlighted code, and diagrams.

---

## 🛠 Technologies Used
- **React** (TypeScript)
- **Vite** (Fast build & dev server)
- **Lucide-react** (Icons)
- **Custom UI library** (in `components/ui/`)
- **OpenMP** (C/C++ examples for parallelism)

---

## 📖 Summary
This project serves as an **interactive, educational platform** for understanding **parallel computing**.  
It explains and visualizes:
- How matrix addition can be done in serial mode
- How different parallelization strategies improve performance
- How OpenMP task-based parallelism works internally

The combination of **code, visuals, and interactive demos** makes complex concepts easy to grasp for students and developers alike.

---
