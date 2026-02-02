<!-- file: src/lib/components/Dialog.svelte -->
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  //import { createEventDispatcher } from 'svelte'; 
  let { isOpen,title,dispatch,closeOnBackdropClick }:
  { isOpen:boolean,title:string,dispatch:(str:string)=>void,closeOnBackdropClick:boolean} = $props();
  //export let isOpen = false; // 控制对话框显示
  //export let title = 'Dialog Title'; // 对话框标题
  //export let closeOnBackdropClick = true; // 点击遮罩层是否关闭
  
  //const dispatch = createEventDispatcher();
  
  function closeDialog() {
    isOpen = false;
    dispatch('close');
  }
  
  function handleBackdropClick(event) {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      closeDialog();
    }
  }
  
  // 处理ESC键关闭
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeDialog();
    }
  }
  
  // 在对话框打开时监听ESC键
  /*
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }*/
</script>

{#if isOpen}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions --> 
  <div   
    class="dialog-backdrop"
    onclick={handleBackdropClick}
    transition:fade={{ duration: 150 }}
    aria-modal="true"
    aria-labelledby="dialog-title"
    role="dialog"
    tabindex = "0"
  >
    <!-- 对话框主体 -->
    <div
      class="dialog-content"
      transition:fly={{ y: 20, duration: 200 }}
    >
      <div class="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          class="close-button"
          onclick={closeDialog}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      <div class="dialog-body">
        <!-- 使用插槽注入自定义内容 -->
    
        <slot />
      </div>
      <div class="dialog-footer">
        <!-- 可选的底部操作区插槽 -->
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}