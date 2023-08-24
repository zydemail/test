/*
 * @Descripttion: 富文本根据接口返回索引位置添加标签
 */
const  is_end_of_tag = function (char) {
  return char === '>';
};
const  is_start_of_tag = function (char) {
  return char === '<';
};
const  is_whitespace = function (char) {
  return /^\s+$/.test(char);
};
const is_tag = function (token) {
  return /^\s*<[^>]+>\s*$/.test(token);
};
const isnt_tag = function (token) {
  return !is_tag(token);
};
const wrap = (tag, content) => {
  let non_tags; let position; let rendering; let tags;
  rendering = '';
  position = 0;
  const { length } = content;
  while (true) {
    if (position >= length) {
      break;
    }
    non_tags = consecutive_where(position, content, isnt_tag);
    position += non_tags.length;
    if (non_tags.length !== 0) {
      rendering += `<${tag}>${non_tags.join('')}</${tag}>`;
    }
    if (position >= length) {
      break;
    }
    tags = consecutive_where(position, content, is_tag);
    position += tags.length;
    rendering += tags.join('');
  }
  return rendering;
};
const consecutive_where = (start, content, predicate) => {
  let answer; let i; let index; let last_matching_index; let len; let token;
  content = content.slice(start, +content.length + 1 || 9e9);
  last_matching_index = void 0;
  for (index = i = 0, len = content.length; i < len; index = ++i) {
    token = content[index];
    answer = predicate(token);
    if (answer === true) {
      last_matching_index = index;
    }
    if (answer === false) {
      break;
    }
  }
  if (last_matching_index != null) {
    return content.slice(0, +last_matching_index + 1 || 9e9);
  }
  return [];
};
const html_to_tokens = function (html) {
  let current_word; let i; let len; let mode; let words;
  mode = 'char';
  current_word = '';
  words = [];
  for (const char of html) {
    switch (mode) {
      case 'tag':
        if (is_end_of_tag(char)) {
          current_word += '>';
          words.push(current_word);
          current_word = '';
          if (is_whitespace(char)) {
            mode = 'whitespace';
          } else {
            mode = 'char';
          }
        } else {
          current_word += char;
        }
        break;
      case 'char':
        if (is_start_of_tag(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = '<';
          mode = 'tag';
        } else if (/\s/.test(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
          mode = 'whitespace';
        } else if (/[\u2010-\u2027\u2E80-\u9FFF\uAC00-\uD7FF\uF900-\uFAFF\uFE30-\uFE40\uFF00-\uFFEF\u{20000}-\u{2EBEF}\u{2F800}-\u{2FA1F}]/u.test(char)) {
          // Is CJK char
          if (current_word) {
            words.push(current_word);
          }
          words.push(char);
          current_word = '';
        } else if (/[\w\#@]+/i.test(char)) {
          current_word += char;
        } else {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
        }
        break;
      case 'whitespace':
        if (is_start_of_tag(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = '<';
          mode = 'tag';
        } else if (is_whitespace(char)) {
          current_word += char;
        } else {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
          mode = 'char';
        }
        break;
      default:
        throw new Error(`Unknown mode ${mode}`);
    }
  }
  if (current_word) {
    words.push(current_word);
  }
  // console.log(words);
  return words;
};
// 切分富文本

// 指定位置添加标签 html为富文本字符串，lists元素为开始和结束位置
export const addTag = (html, lists) => {
  const tokens = html_to_tokens(html);
  lists.forEach((item) => {
    const [startNum, endNum] = item;
    if (startNum === endNum - 1) {
      tokens[startNum] = `<span class="highlight">${tokens[startNum]}</span>`;
    } else {
      tokens[startNum] = `<span class="highlight">${tokens[startNum]}`;
      tokens[endNum - 1] = `${tokens[endNum] - 1}</span>`;
    }
  });
  return tokens.join('');
};

