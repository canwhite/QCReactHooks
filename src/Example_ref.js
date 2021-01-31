import React, {useRef, useImperativeHandle, forwardRef} from 'react'

//看这里，需要传入ref哟
function Example5_1(props,ref){
    const inputRef = useRef();//父组件需要create
    //参数是传进来的ref，和对应事件
    useImperativeHandle(ref,()=>({
        focus:()=>{
            inputRef.current.focus();
        }
    }))
    return <input ref={inputRef} />
}

//useImperativeHandle配合forwardRef使用，前后ref建立也依赖于这个
export default forwardRef(Example5_1);

