import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you
import { unified, Processor } from 'unified';

export const markdownProcessor: Processor = unified()
  .use(rehypeRaw)
  .use(remarkMath)
  .use(rehypeKatex);
