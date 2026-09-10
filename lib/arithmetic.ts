const operators: Record<string, { precedence: number; apply: (a: number, b: number) => number }> = {
  "+": { precedence: 1, apply: (a,b) => a+b }, "-": { precedence: 1, apply: (a,b) => a-b },
  "*": { precedence: 2, apply: (a,b) => a*b }, "/": { precedence: 2, apply: (a,b) => a/b },
};
export function calculate(input: string): number | null {
  const compact=input.replace(/\s/g,""); if(!compact) return 0;
  const tokens=compact.match(/(?:\d+(?:[.,]\d+)?)|[+\-*/()]/g); if(!tokens || tokens.join("")!==compact) return null;
  const values:number[]=[], ops:string[]=[];
  const reduce=()=>{const op=ops.pop()!,b=values.pop()!,a=values.pop()!; const v=operators[op].apply(a,b); if(!Number.isFinite(v)) throw Error(); values.push(v);};
  try { let expect=true; for(let i=0;i<tokens.length;i++){const t=tokens[i];
    if(/^\d/.test(t)){if(!expect)return null; values.push(Number(t.replace(",",".")));expect=false;}
    else if(t==="("){if(!expect)return null;ops.push(t);expect=true;}
    else if(t===")"){if(expect)return null;while(ops.at(-1)!=="("){if(!ops.length)return null;reduce();}ops.pop();expect=false;}
    else {if(expect){if(t==="-" ){values.push(0);} else return null;} while(ops.at(-1)!=="("&&operators[ops.at(-1)!]?.precedence>=operators[t].precedence)reduce();ops.push(t);expect=true;}
  } if(expect)return null; while(ops.length){if(ops.at(-1)==="(")return null;reduce();} return values.length===1?Math.max(0,values[0]):null;} catch{return null;}
}
