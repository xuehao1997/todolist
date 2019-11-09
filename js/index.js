//非父子通信bus总线
var bus = new Vue();

//头部  组件
Vue.component( 'Tab' , {
    template:'#tab',
    //这里执行的就是bus总线申明的事件
   methods: {
    change_input_flag () {
        bus.$emit('input_flag_change');
    }
   }
});

//内容组件
Vue.component( 'Container' , {
    template:'#container',
    data () {
        return {
            input_flag:false
        }
    },
    props:['todos','change_mask_flag'],//props属性通过数组形式接收，接收后相当于全局变量
    //执行自定义事件
    methods:{
        changeContainerFlag ( index ) {
            this.$emit( 'change_flag' , index);//参数在这里传
        },
        checkDone ( index ) {//点击垃圾桶检查Root中的完成状态
            this.$emit('check' , index);//订阅事件
        },
        addItem (e) {
            this.$emit('add' , e.target.value);
        }
    },
    mounted () {
        var that = this;
        //用bus总线定义自定义事件
        bus.$on('input_flag_change' , function () {
            that.input_flag = !that.input_flag;
        })
        
    }
});

//弹窗
Vue.component( 'MyMask' , {//<my-mask></my-mask>
    template:'#mask',
    props:['close_mask','active_index','remove'],
    methods:{
        //用props接收过的方法就是这个组件本身的方法，可以直接this调用
        confirm () {
            this.close_mask();
            this.remove(this.active_index);
        }
    }
});
//底部导航栏
Vue.component('TabBar', {
    template:"#tabbar",
    props:['type'],
    methods: {
        changeType (val) {
            this.$emit('get_type',val);
        }
    },
    data () {
        return {
            tabbars:[
                {
                    id:1,
                    text:'A',
                    class:'circle-success'
                },
                {
                    id:2,
                    text:'F',
                    class:'circle-primary'
                },
                {
                    id:3,
                    text:'U',
                    class:'circle-danger'
                }
            ]
        }
    },
   
})


//数据应该绑定在父组件上，传给Container组件，完成父子通信
new Vue({
    el:'#app',
    data:{
        maskFlag:false,
        active_index:0,
        type:'A',
        todos:[
            {
                id:1,
                task:'任务一',
                done:true//表示任务已经完成
            },
            {
                id:2,
                task:'任务二',
                done:true
            }
        ]
    },
    computed:{//计算属性中写函数
        newTodos () {
            switch (this.type) {
                case 'A':
                    return this.todos;
                break;
                case 'F':
                    return this.todos.filter( item => item.done)
                break;
                case 'U':
                    return this.todos.filter( item => !item.done )
                break;
                default:
                    break;
            }
        }

    }
    ,
    methods:{//在子组件中发布changeFlag事件
        //子父通信：在父组件中定义一个方法，在子组件中定义自定义事件，将参数传递给父组件
        //点击√事件：要改变父组件root中done值-->子父通信
        changeFlag ( index ) {//要确定修改的是哪一条
            this.todos[ index ].done = !this.todos[ index ].done;
        },
        //点击垃圾桶事件:要删除父组件root中数组的一项-->
        check ( index ) {
            const flag =  this.todos[index].done;
            if( flag ){ 
                this.remove();
            }else{
                //弹框提示
                this.active_index = index;
                this.changeMaskFlag();
            }
        },
        remove ( index ) {
            //对数组数据的操作
            //splice删除数组中元素
            this.todos.splice(index,1);
        },
        //开启遮罩层：父子通信，因为只是在子组件需要执行父组件的方法就行了
        changeMaskFlag () {
            this.maskFlag = true;
        },
        //关闭遮罩层
        closeMask () {
            this.maskFlag = false;
        },
        add ( val ) {
            //数组添加
            this.todos.push({
                id:sort(this.todos)[0].id+1,
                task:val,
                done:true
            })
        },
        //子父通信
        changeType (val) {
            this.type = val;
        }
    }
});

//如果不写排序，可能会报错
//比较对象的属性
function sort (arr) {
    return arr.sort(function(a,b){
        return b.id - a.id
    })
}
