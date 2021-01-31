import './App.css';
import React,{useState,useReducer,useEffect,createContext,useContext,useRef, createRef, useCallback,useMemo, useLayoutEffect} from 'react';
import Example5_1 from './Example_ref'
/*
函数组件和类组件
s
函数组件更符合React的思想，数据驱动视图，不含有任何的副作用和状态。
但是因为状态和生命钩子等其它功能，最后又会被改成类组件

但是类组件本身也存在问题，HOC render props，需要重新封装，有时候
甚至会出现嵌套地狱


为了解决这些问题，react有了Hooks
为react添加生命周期

*/


/*==================================================================================
*1.useState
*useState就是React提供的最基础的Hook，主要用来定义本地状态
*返回一个数组
*
===================================================================================*/
function Example(){

  const [count,setCount] = useState(0);

  return(
    <div>
      <span>{count}</span>
      <button onClick={()=> setCount((count)=>count + 1)}>+</button>
      <button onClick={() => setCount((count) => count - 1)}>-</button>

    </div>
  )
}






/*==============================================================================
*2.useReducer
* 当我们要在函数组件中处理复杂多层数据逻辑时，使用useState就开始力不从心，值得庆幸的是，
* React为我们提供了useReducer来处理函数组件中复杂状态逻辑,如果用过redux会很熟悉
* useReducer接受两个参数: reducer函数和默认值
* 返回数组
=================================================================================*/


//接收两个参数
const reducer = (state,action)=>{

  switch(action.type){
    case 'increment':
      return {count:state.count+1}
    case 'decrement':
      return {count:state.count-1}
    default:
      return {count:state.count}
  }
}



function Example2(){

  //接收reducer函数和默认值
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const {count} = state;

  return(
    <div> 
      <span>{count}</span>
      <button onClick={()=>dispatch({type:"increment"})}>+</button>
      <button onClick={()=>dispatch({type:"decrement"})}>-</button>

    </div>
  )
}

/*
和Redux的区别在于：
Redux的默认值是通过给reducer函数赋值默认参数的方式给定
const reducer = function (state = { count: 0 }, action) {。。。}

------------------------------------------------------------------------
useReducer没有采用Redux的逻辑，React认为state的默认值可能是来自于函数组件的props
虽然不推荐，但也允许你类似Redux的方式去赋值默认值。
这就要接触useReducer的第三个参数: initialization，用来初始化状态，没有必要撒
-------------------------------------------------------------------------

import React, { useReducer } from 'react'

const reducer = function (state = {count: 0}, action) {
  // 省略...
}

function Example({initialState = 0}) {
  const [state, dispatch] = useReducer(reducer, undefined, reducer());
  // 省略...
}

*/







/*==================================================================================
*3. useEffect useLayoutEffect
*解决了函数组件中内部状态的定义，接下来亟待解决的函数组件中生命周期函数的问题。
*可以认为useEffect是componentDidMount和componentDidUpdate结合体，
*如果有第二个参数[]的时候，可以认为是componentDidMount,就加在返回函数的后边
*可以创建多个useEffect来处理不同事件
*useLayoutEffect VS useEffect
****useLayoutEffect里面的callback函数会在DOM更新完成后立即执行,
****但是会在浏览器进行任何绘制之前运行完成,阻塞了浏览器的绘制，只展示最终结果。
****所以不会出现和useEffects的闪屏
===================================================================================*/

function Example3(){

  const [count,setCount] = useState(0);

  //useEffect传入了一个函数，相等于组件加载完的回调
  //第二个参数可以是一个空数组，表示componentDidMount
  useEffect(()=>{

    document.title = `You clicked ${count} times`
    console.log('123')
    //我们知道类似监听事件的副作用在组件卸载时应该及时被清除，否则会造成内存泄露。
    //因此执行顺序是在下一次回调调用之前,也就是新的一次更新或者加载页面之前:
    //render -> effect callback -> re-render -> clean callback -> effect callback
    //so.用以模拟componentWillUnmount行为
    return () => {
      console.log('clean up!')
    }
  
  },[]);//[]为空相当于componentDidMount，但是加上count值，就和memo很像了
  //useEffect VS useMemo memo是在dom更新前触发的，effect是dom更新后
  //
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click +
      </button>
      <button>Click do nothing</button>
    </div>
  );
}


/*==================================================================================
*4.useContext
*借助Hook:useContext,我们也可以在函数组件中使用context。
*相比于在类组件中需要通过render props的方式使用，useContext的使用则相当方便。
*可以将一种状态通过Provider和value分享给一批组件，但是一个状态改变，其它的也会改变
===================================================================================*/
//函数组件这样用
const Context = createContext({ color: 'color', background: 'white'});
function Example4(){

    const theme = useContext(Context);
    return (
        <p style={{color: theme.color,background:theme.background}}>Hello World!</p>
    );

}
//类组件这样用
class TestExample4 extends React.Component {
  state = {
    color: "red",
    background: "black"
  };

  render() {
    return (
        <Context.Provider value={{ color: this.state.color, background: this.state.background}}>
          <Example4/>
          <button onClick={() => this.setState({color: 'blue'})}>color</button>
          <button onClick={() => this.setState({background: 'yellow'})}>backgroud</button>
        </Context.Provider>
    );
  }
}
/*
PS:
每当Provider中的值发生改变时，函数组件就会重新渲染，需要注意的是，
即使的context的未使用的值发生改变时，函数组件也会重新渲染，
正如上面的例子，Example组件中即使没有使用过background，但background发生改变时，
Example也会重新渲染。因此必要时，如果Example组件还含有子组件，
你可能需要添加shouldComponentUpdate防止不必要的渲染浪费性能。


*/


/*==================================================================================
*5.useRef
*useRef常用在访问子元素的实例
===================================================================================*/

function Example5(){


  //1. 基本使用访问实例
  const inputEl = useRef();
  const onButtonClick = ()=>{

    inputEl.current.focus();
  }
  //2.useRef还也可以创建类属性,通过初始值返回一个可变对象，贯穿整个生命周期
  //内容放在了current下边
  const refContainner = useRef({a:'123'})


  //3.useImperativeHandle用于自定义暴露给父组件的ref属性。需要配合forwardRef一起使用
  //这个实践我们创建一个新的文件来试试,下边的TestExample5_1测试



  return(
    <div>
      <span>{refContainner.current.a}</span>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </div>
  )

}


class TestExample5 extends React.Component{
  constructor(props){
    super(props);
    //创建一个ref，并最终传给子组件
    this.inputRef1 = createRef()

  }
  render =()=>{

    return(
      <div>
        <Example5_1  ref={this.inputRef1} />
        <button onClick={()=>this.inputRef1.current.focus()}>click</button>
      </div>
    )
  }
}




/*==================================================================================
*6.useCallback useMemo
*useCallback解决的就是bind的问题，事件缓存的
*useMemo涉及到浅对比
*useCallback接受一个函数和数组
*useMemo接受并返回一个函数和数组
*useCallback(fn, input) 
*useMemo(() => fn, input)

===================================================================================*/



//useMemo
function Example6(props){
  // 当props.count发生改变的时候，会触发事件，自动触发，不需调用
  useMemo(() => doSomething(props.count), [props.count])
  function doSomething(count){
    console.log('useMemo',count);
  }
  return <div>
      <div>
          <p><span>{props.count}</span></p>

          <button onClick={props.onClick}>
            +1
          </button>
      </div>
  </div>;
}


//useCallback
function TestExample6(){

  const [count, setCount] = useState(0);

  //从Example6可以看到，memo不需要调用，自动含有浅比较的过程
  //而useCallback需要调用，
  //那么，useCallback有什么意义呢？
  //意义就在于，执行的时候，并不是每次都新建memoizedCallback方法，不用反复新建，解决了同一性问题
  //可以和memo搭配使用
  const myCallback =  useCallback(()=>{changeData(count)},[count]);
  function changeData(data){
    console.log('setCount',data +1)
    setCount(data+1)
  };

  return <div>
      <div>
          <Example6 count={count} onClick={myCallback}></Example6>
      </div>
  </div>;

}





/*==================================================================================
*7.自定义hook
*以use开头的函数，可以将官方的一些hook组合
*可以用来将逻辑提出，也解决组件嵌套地狱的问题
*最后搞一个,类似于下边的实现但是，这个例子还不是很完整
===================================================================================*/

/*


import {useReducer,useRef,useLayoutEffect} from 'react';

//createSave
//只在一处使用
export const createSave = defaultValue=>{
    const context = {
      value:defaultValue,
      subs:new Set(),
      Provider:function Provider({value,children}){
        useLayoutEffect(()=>{
          context.subs.forEach(fn=>fn(value))
          context.value = value;
        })
        return children;
      }

    }
    return context;
}



//useSave
export const useSave = (context, selector) => {

    //主要是针对context里封装的三个值来进行操作

    //useReducer本身是抓两个参数，一个是reducer方法，一个初始值，返回数组一个state，一个dispatch
    //感觉在这里当作计数器了
    const [, forceUpdate] = useReducer(c => c + 1, 0)

    //如果select是作为方法展开的，那么就将context.value作为参数放进去
    //否则selected就是value值，并且最终返回
    const selected = selector ? selector(context.value) : context.value


    //ref在这里应该是作为一个属性值存在的
    //先将current赋值为null
    const ref = useRef(null)
  
    //切片1：这个时间切片将selected赋值给ref.current
    useLayoutEffect(() => {
      ref.current = selected
    })

    
    const subs = context.subs


    //切片2：每当更新之后
    useLayoutEffect(() => {
      //fn：如果selected是个方法就打住
      const fn = nextValue => {
        if (ref.current === selector(nextValue)) return
        //否则就输出个数字标识
        forceUpdate()
      }
      //subs个数
      subs.add(fn)

      //在unmount的时候删除
      return () => subs.delete(fn)
    }, [subs])



    //最后返回selected
    return selected
}




*/





/*
总结：
借助于Hooks，函数组件已经能基本实现绝大部分的类组件的功能
React并不建议我们全部用Hooks重写之前的类组件，
而是建议我们在新的组件或者非关键性组件中使用Hooks。

*/












function App() {


  return (
    <div className="App">
      <TestExample6 />

    </div>
  );
}

export default App;
