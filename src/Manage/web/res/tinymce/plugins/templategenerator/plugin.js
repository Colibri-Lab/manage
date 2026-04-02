tinymce.PluginManager.add('templategenerator', function (editor) {

    function loadCss(file, doc = document) {
        if (doc.getElementById(file)) return;

        const link = doc.createElement('link');
        link.id = file;
        link.rel = 'stylesheet';
        link.href = file;

        doc.head.appendChild(link);
    }

    editor.ui.registry.addIcon('cycle', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.9994 5.5009C15.0306 6.61917 14.6342 7.70727 13.891 8.54341C13.1477 9.37954 12.1136 9.90079 10.9994 10.0009C10.9911 9.65849 10.9235 9.32013 10.7994 9.00089C11.6692 8.91145 12.4758 8.50547 13.0658 7.86015C13.6558 7.21484 13.988 6.3752 13.9994 5.5009C13.9961 4.599 13.6455 3.73303 13.0203 3.08292C12.3952 2.4328 11.5437 2.04852 10.6426 2.0099C9.7415 1.97128 8.86018 2.2813 8.18172 2.87555C7.50327 3.4698 7.07983 4.30258 6.99939 5.20089C6.67741 5.08647 6.34061 5.01911 5.99939 5.0009C6.14785 3.90649 6.68329 2.90142 7.50875 2.16768C8.33421 1.43393 9.39513 1.02002 10.4994 1.00089C11.091 0.998381 11.6773 1.11306 12.2244 1.33832C12.7715 1.56357 13.2686 1.89494 13.687 2.31331C14.1053 2.73167 14.4367 3.22875 14.662 3.77585C14.8872 4.32295 15.0019 4.90924 14.9994 5.5009ZM5.49939 6.0009C4.60938 6.0009 3.73935 6.26482 2.99933 6.75928C2.2593 7.25375 1.68253 7.95655 1.34193 8.77882C1.00134 9.60109 0.912224 10.5059 1.08586 11.3788C1.25949 12.2517 1.68807 13.0535 2.31741 13.6829C2.94675 14.3122 3.74857 14.7408 4.62149 14.9144C5.4944 15.0881 6.3992 14.9989 7.22147 14.6584C8.04373 14.3178 8.74654 13.741 9.241 13.001C9.73547 12.2609 9.99939 11.3909 9.99939 10.5009C9.99939 9.90995 9.883 9.32478 9.65685 8.77882C9.4307 8.23285 9.09924 7.73678 8.68137 7.31891C8.26351 6.90105 7.76743 6.56958 7.22147 6.34344C6.6755 6.11729 6.09034 6.0009 5.49939 6.0009Z" fill="#424242"/></svg>');
    editor.ui.registry.addIcon('while', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.9994 5.5009C15.0306 6.61917 14.6342 7.70727 13.891 8.54341C13.1477 9.37954 12.1136 9.90079 10.9994 10.0009C10.9911 9.65849 10.9235 9.32013 10.7994 9.00089C11.6692 8.91145 12.4758 8.50547 13.0658 7.86015C13.6558 7.21484 13.988 6.3752 13.9994 5.5009C13.9961 4.599 13.6455 3.73303 13.0203 3.08292C12.3952 2.4328 11.5437 2.04852 10.6426 2.0099C9.7415 1.97128 8.86018 2.2813 8.18172 2.87555C7.50327 3.4698 7.07983 4.30258 6.99939 5.20089C6.67741 5.08647 6.34061 5.01911 5.99939 5.0009C6.14785 3.90649 6.68329 2.90142 7.50875 2.16768C8.33421 1.43393 9.39513 1.02002 10.4994 1.00089C11.091 0.998381 11.6773 1.11306 12.2244 1.33832C12.7715 1.56357 13.2686 1.89494 13.687 2.31331C14.1053 2.73167 14.4367 3.22875 14.662 3.77585C14.8872 4.32295 15.0019 4.90924 14.9994 5.5009ZM5.49939 6.0009C4.60938 6.0009 3.73935 6.26482 2.99933 6.75928C2.2593 7.25375 1.68253 7.95655 1.34193 8.77882C1.00134 9.60109 0.912224 10.5059 1.08586 11.3788C1.25949 12.2517 1.68807 13.0535 2.31741 13.6829C2.94675 14.3122 3.74857 14.7408 4.62149 14.9144C5.4944 15.0881 6.3992 14.9989 7.22147 14.6584C8.04373 14.3178 8.74654 13.741 9.241 13.001C9.73547 12.2609 9.99939 11.3909 9.99939 10.5009C9.99939 9.90995 9.883 9.32478 9.65685 8.77882C9.4307 8.23285 9.09924 7.73678 8.68137 7.31891C8.26351 6.90105 7.76743 6.56958 7.22147 6.34344C6.6755 6.11729 6.09034 6.0009 5.49939 6.0009Z" fill="#424242"/></svg>');
    editor.ui.registry.addIcon('args', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.0003 6H10.0003V5.5C10.0003 5.22386 9.7764 5 9.50026 5H8.47926V10.5C8.47926 10.7761 8.70312 11 8.97926 11H9.47926V12H6.47926V11H6.97926C7.2554 11 7.47926 10.7761 7.47926 10.5V5H6.50026C6.22412 5 6.00026 5.22386 6.00026 5.5V6H5.00026V4H11.0003V6ZM13.9145 8.0481L12.4522 6.58581L13.1593 5.87871L14.9751 7.69454V8.40165L13.2074 10.1694L12.5003 9.46231L13.9145 8.0481ZM3.54835 9.4623L2.08605 8.00002L3.50026 6.58581L2.79316 5.8787L1.02539 7.64647V8.35357L2.84124 10.1694L3.54835 9.4623Z" fill="#424242"/></svg>');
    editor.ui.registry.addIcon('foreach', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.2503 5.75V1.75H12.7503V4.2916C11.6053 2.93303 9.8393 2.08334 7.90945 2.08334C4.73346 2.08334 1.98972 4.39036 1.75102 7.48075L1.73022 7.75H3.2313L3.25318 7.5241C3.46572 5.32932 5.45539 3.58334 7.90945 3.58334C9.64551 3.58334 11.1531 4.45925 11.959 5.75H9.13016V7.25H13.2923L14.2538 6.27493V5.75H14.2503ZM8.00028 14C9.10485 14 10.0003 13.1046 10.0003 12C10.0003 10.8954 9.10485 10 8.00028 10C6.89571 10 6.00028 10.8954 6.00028 12C6.00028 13.1046 6.89571 14 8.00028 14Z" fill="#007ACC"/></svg>');
    editor.ui.registry.addIcon('condition', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4967 4C10.6552 3.9989 9.8416 4.30189 9.20581 4.85315C8.57002 5.40442 8.15489 6.16684 8.03674 7H4.93665C4.81495 6.52867 4.52557 6.11794 4.12268 5.84473C3.71979 5.57152 3.23108 5.45466 2.74817 5.51599C2.26526 5.57733 1.82131 5.81261 1.49951 6.17786C1.17772 6.54311 1.00024 7.01322 1.00024 7.5C1.00024 7.98679 1.17772 8.45689 1.49951 8.82215C1.82131 9.1874 2.26526 9.42267 2.74817 9.48401C3.23108 9.54535 3.71979 9.42848 4.12268 9.15528C4.52557 8.88207 4.81495 8.47133 4.93665 8H8.03674C8.13261 8.66418 8.41741 9.28683 8.85718 9.7937C9.29694 10.3006 9.87308 10.6703 10.5171 10.8589C11.1611 11.0475 11.8458 11.047 12.4895 10.8574C13.1332 10.6679 13.7089 10.2973 14.1479 9.7898C14.587 9.28227 14.8708 8.65919 14.9657 7.99488C15.0606 7.33056 14.9624 6.65298 14.683 6.04285C14.4036 5.43272 13.9547 4.91578 13.3898 4.55359C12.8248 4.19141 12.1678 3.99922 11.4967 4ZM11.4967 10C11.0023 10 10.5189 9.85332 10.1078 9.57862C9.69666 9.30391 9.37623 8.91348 9.18701 8.45667C8.99779 7.99985 8.94834 7.49728 9.0448 7.01233C9.14126 6.52738 9.37925 6.08181 9.72888 5.73218C10.0785 5.38255 10.5241 5.14456 11.009 5.0481C11.494 4.95164 11.9966 5.00109 12.4534 5.19031C12.9102 5.37953 13.3006 5.69996 13.5753 6.11109C13.85 6.52221 13.9967 7.00555 13.9967 7.5C13.9967 8.16304 13.7334 8.79898 13.2645 9.26783C12.7957 9.73667 12.1597 10 11.4967 10Z" fill="#007ACC"/></svg>');
    editor.ui.registry.addIcon('if', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4967 4C10.6552 3.9989 9.8416 4.30189 9.20581 4.85315C8.57002 5.40442 8.15489 6.16684 8.03674 7H4.93665C4.81495 6.52867 4.52557 6.11794 4.12268 5.84473C3.71979 5.57152 3.23108 5.45466 2.74817 5.51599C2.26526 5.57733 1.82131 5.81261 1.49951 6.17786C1.17772 6.54311 1.00024 7.01322 1.00024 7.5C1.00024 7.98679 1.17772 8.45689 1.49951 8.82215C1.82131 9.1874 2.26526 9.42267 2.74817 9.48401C3.23108 9.54535 3.71979 9.42848 4.12268 9.15528C4.52557 8.88207 4.81495 8.47133 4.93665 8H8.03674C8.13261 8.66418 8.41741 9.28683 8.85718 9.7937C9.29694 10.3006 9.87308 10.6703 10.5171 10.8589C11.1611 11.0475 11.8458 11.047 12.4895 10.8574C13.1332 10.6679 13.7089 10.2973 14.1479 9.7898C14.587 9.28227 14.8708 8.65919 14.9657 7.99488C15.0606 7.33056 14.9624 6.65298 14.683 6.04285C14.4036 5.43272 13.9547 4.91578 13.3898 4.55359C12.8248 4.19141 12.1678 3.99922 11.4967 4ZM11.4967 10C11.0023 10 10.5189 9.85332 10.1078 9.57862C9.69666 9.30391 9.37623 8.91348 9.18701 8.45667C8.99779 7.99985 8.94834 7.49728 9.0448 7.01233C9.14126 6.52738 9.37925 6.08181 9.72888 5.73218C10.0785 5.38255 10.5241 5.14456 11.009 5.0481C11.494 4.95164 11.9966 5.00109 12.4534 5.19031C12.9102 5.37953 13.3006 5.69996 13.5753 6.11109C13.85 6.52221 13.9967 7.00555 13.9967 7.5C13.9967 8.16304 13.7334 8.79898 13.2645 9.26783C12.7957 9.73667 12.1597 10 11.4967 10Z" fill="#007ACC"/></svg>');
    editor.ui.registry.addIcon('template', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.00024 2.98361V2.97184V2H5.91107C5.59767 2 5.29431 2.06161 5.00152 2.18473C4.70842 2.30798 4.44967 2.48474 4.22602 2.71498C4.00336 2.94422 3.83816 3.19498 3.73306 3.46766L3.73257 3.46898C3.63406 3.7352 3.56839 4.01201 3.53557 4.29917L3.53543 4.30053C3.50702 4.5805 3.49894 4.86844 3.51108 5.16428C3.52297 5.45379 3.52891 5.74329 3.52891 6.03279C3.52891 6.23556 3.48999 6.42594 3.41225 6.60507L3.41185 6.60601C3.33712 6.78296 3.23447 6.93866 3.10341 7.07359C2.97669 7.20405 2.8249 7.31055 2.64696 7.3925C2.47084 7.46954 2.28522 7.5082 2.08942 7.5082H2.00024V7.6V8.4V8.4918H2.08942C2.2849 8.4918 2.47026 8.53238 2.64625 8.61334L2.64766 8.61396C2.82482 8.69157 2.97602 8.79762 3.10245 8.93161L3.10436 8.93352C3.23452 9.0637 3.33684 9.21871 3.41153 9.39942L3.41225 9.40108C3.49011 9.58047 3.52891 9.76883 3.52891 9.96721C3.52891 10.2567 3.52297 10.5462 3.51108 10.8357C3.49894 11.1316 3.50701 11.4215 3.5354 11.7055L3.5356 11.7072C3.56844 11.9903 3.63412 12.265 3.73256 12.531L3.73307 12.5323C3.83817 12.805 4.00336 13.0558 4.22602 13.285C4.44967 13.5153 4.70842 13.692 5.00152 13.8153C5.29431 13.9384 5.59767 14 5.91107 14H6.00024V13.2V13.0164H5.91107C5.71119 13.0164 5.52371 12.9777 5.34787 12.9008C5.17421 12.8191 5.02218 12.7126 4.89111 12.5818C4.76411 12.4469 4.66128 12.2911 4.58247 12.1137C4.50862 11.9346 4.47158 11.744 4.47158 11.541C4.47158 11.3127 4.47554 11.0885 4.48346 10.8686C4.49149 10.6411 4.49151 10.4195 4.48349 10.2039C4.47938 9.98246 4.46109 9.76883 4.42847 9.56312C4.39537 9.35024 4.33946 9.14757 4.26063 8.95536C4.18115 8.76157 4.07282 8.57746 3.9364 8.40298C3.8237 8.25881 3.68563 8.12462 3.52307 8C3.68563 7.87538 3.8237 7.74119 3.9364 7.59702C4.07282 7.42254 4.18115 7.23843 4.26063 7.04464C4.33938 6.85263 4.39537 6.65175 4.4285 6.44285C4.46107 6.2333 4.47938 6.01973 4.48349 5.80219C4.49151 5.58262 4.4915 5.36105 4.48345 5.13749C4.47554 4.9134 4.47158 4.68725 4.47158 4.45902C4.47158 4.26019 4.50857 4.07152 4.58263 3.89205C4.6616 3.71034 4.76445 3.55475 4.8911 3.42437C5.02218 3.28942 5.17485 3.18275 5.34826 3.10513C5.52404 3.02427 5.71138 2.98361 5.91107 2.98361H6.00024ZM10.0002 13.0164V13.0282V14H10.0894C10.4028 14 10.7062 13.9384 10.999 13.8153C11.2921 13.692 11.5508 13.5153 11.7745 13.285C11.9971 13.0558 12.1623 12.805 12.2674 12.5323L12.2679 12.531C12.3664 12.2648 12.4321 11.988 12.4649 11.7008L12.4651 11.6995C12.4935 11.4195 12.5015 11.1316 12.4894 10.8357C12.4775 10.5462 12.4716 10.2567 12.4716 9.96721C12.4716 9.76444 12.5105 9.57406 12.5882 9.39493L12.5886 9.39399C12.6634 9.21704 12.766 9.06134 12.8971 8.92642C13.0238 8.79595 13.1756 8.68945 13.3535 8.6075C13.5296 8.53046 13.7153 8.4918 13.9111 8.4918H14.0002V8.4V7.6V7.5082H13.9111C13.7156 7.5082 13.5302 7.46762 13.3542 7.38666L13.3528 7.38604C13.1757 7.30844 13.0245 7.20238 12.898 7.06839L12.8961 7.06648C12.766 6.9363 12.6637 6.78129 12.589 6.60058L12.5882 6.59892C12.5104 6.41953 12.4716 6.23117 12.4716 6.03279C12.4716 5.74329 12.4775 5.45379 12.4894 5.16428C12.5015 4.86842 12.4935 4.57848 12.4651 4.29454L12.4649 4.29285C12.4321 4.00971 12.3664 3.73502 12.2679 3.46897L12.2674 3.46766C12.1623 3.19499 11.9971 2.94422 11.7745 2.71498C11.5508 2.48474 11.2921 2.30798 10.999 2.18473C10.7062 2.06161 10.4028 2 10.0894 2H10.0002V2.8V2.98361H10.0894C10.2893 2.98361 10.4768 3.0223 10.6526 3.09917C10.8263 3.18092 10.9783 3.28736 11.1094 3.41823C11.2364 3.55305 11.3392 3.70889 11.418 3.88628C11.4919 4.0654 11.5289 4.25596 11.5289 4.45902C11.5289 4.68727 11.5249 4.91145 11.517 5.13142C11.509 5.35894 11.509 5.58049 11.517 5.79605C11.5211 6.01754 11.5394 6.23117 11.572 6.43688C11.6051 6.64976 11.661 6.85243 11.7399 7.04464C11.8193 7.23843 11.9277 7.42254 12.0641 7.59702C12.1768 7.74119 12.3149 7.87538 12.4774 8C12.3149 8.12462 12.1768 8.25881 12.0641 8.40298C11.9277 8.57746 11.8193 8.76157 11.7399 8.95536C11.6611 9.14737 11.6051 9.34825 11.572 9.55715C11.5394 9.7667 11.5211 9.98027 11.517 10.1978C11.509 10.4174 11.509 10.6389 11.517 10.8625C11.5249 11.0866 11.5289 11.3128 11.5289 11.541C11.5289 11.7398 11.4919 11.9285 11.4179 12.1079C11.3389 12.2897 11.236 12.4452 11.1094 12.5756C10.9783 12.7106 10.8256 12.8173 10.6522 12.8949C10.4764 12.9757 10.2891 13.0164 10.0894 13.0164H10.0002Z" fill="#424242"/></g><defs><clipPath id="clip0"><rect width="16" height="16" fill="white" transform="translate(0.000244141)"/></clipPath></defs></svg>');
    editor.ui.registry.addIcon('var', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.00024 5H4.00024V4H1.50024L1.00024 4.5V12.5L1.50024 13H4.00024V12H2.00024V5ZM14.5002 4H12.0002V5H14.0002V12H12.0002V13H14.5002L15.0002 12.5V4.5L14.5002 4ZM11.7603 6.56995L12.0002 7V9.51001L11.7002 9.95996L7.2002 11.96H6.74023L4.24023 10.46L4.00024 10.03V7.53003L4.30029 7.06995L8.80029 5.06995H9.26025L11.7603 6.56995ZM5.00024 9.70996L6.50024 10.61V9.28003L5.00024 8.38V9.70996ZM5.5802 7.56006L7.03027 8.43005L10.4203 6.93005L8.97021 6.06006L5.5802 7.56006ZM7.53027 10.73L11.0303 9.17004V7.77002L7.53027 9.31995V10.73Z" fill="#007ACC"/></svg>');
    editor.ui.registry.addIcon('variable', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.00024 5H4.00024V4H1.50024L1.00024 4.5V12.5L1.50024 13H4.00024V12H2.00024V5ZM14.5002 4H12.0002V5H14.0002V12H12.0002V13H14.5002L15.0002 12.5V4.5L14.5002 4ZM11.7603 6.56995L12.0002 7V9.51001L11.7002 9.95996L7.2002 11.96H6.74023L4.24023 10.46L4.00024 10.03V7.53003L4.30029 7.06995L8.80029 5.06995H9.26025L11.7603 6.56995ZM5.00024 9.70996L6.50024 10.61V9.28003L5.00024 8.38V9.70996ZM5.5802 7.56006L7.03027 8.43005L10.4203 6.93005L8.97021 6.06006L5.5802 7.56006ZM7.53027 10.73L11.0303 9.17004V7.77002L7.53027 9.31995V10.73Z" fill="#007ACC"/></svg>');
    const commands = [
        {
            name: 'args',
            item: '$args->',
            type: ['inline'],
            create: 'after',
            icon: 'args',
            class: 'variable',
            params: [
                { content: '{?&nbsp;echo&nbsp;$args->', type: 'placeholder' },
                { type: 'var', name: 'var' },
                { content: '&nbsp;?}', type: 'placeholder' }
            ]
        },
        {
            name: 'var',
            item: '$variable',
            type: ['inline'],
            create: 'after',
            class: 'variable',
            icon: 'var',
            params: [
                { content: '{?&nbsp;echo&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'var' },
                { content: '&nbsp;?}', type: 'placeholder' }
            ]
        },
        {
            name: 'cmd',
            item: '$cmd',
            type: ['inline'],
            create: 'after',
            class: 'variable',
            icon: 'var',
            params: [
                { content: '{?&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'var' },
                { content: '&nbsp;?}', type: 'placeholder' }
            ]
        },
        {
            name: 'subtemplate',
            item: '$subtemplate',
            type: ['inline', 'block'],
            create: 'after',
            class: 'template',
            icon: 'template',
            params: [
                { content: '{?&nbsp;echo&nbsp;Templates::Execute(\'', type: 'placeholder' },
                { type: 'var', name: 'template' },
                { content: '\', ', type: 'placeholder' },
                { type: 'var', name: 'params' },
                { content: '&nbsp;);&nbsp;?}', type: 'placeholder' },
            ]
        },
        {
            name: 'if',
            item: 'if(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                { content: '{?&nbsp;if(&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'condition' },
                { content: '&nbsp;): ?}', type: 'placeholder' },
            ],
        },
        {
            name: 'elseif',
            item: 'elseif(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                { content: '{?&nbsp;elseif(&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'condition' },
                { content: '&nbsp;):&nbsp;?}', type: 'placeholder' },
            ],
        },
        {
            name: 'else',
            item: 'else:',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                { content: '{?&nbsp;else:&nbsp;?} ', type: 'placeholder' },
            ],
        },
        {
            name: 'endif',
            item: 'endif;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'condition',
            icon: 'if',
            params: [
                { content: '{?&nbsp;endif;&nbsp;?} ', type: 'placeholder' },
            ],
        },
        {
            name: 'while',
            item: 'while(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'cycle',
            icon: 'while',
            params: [
                { content: '{?&nbsp;while(&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'condition' },
                { content: '&nbsp;):&nbsp;?}', type: 'placeholder' },
            ],
        },
        {
            name: 'endwhile',
            item: 'endwhile;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'cycle',
            icon: 'while',
            params: [
                { content: '{?&nbsp;endwhile;&nbsp;?}', type: 'placeholder' },
            ],
        },
        {
            name: 'foreach',
            item: 'foreach(list as item):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'cycle',
            icon: 'foreach',
            params: [
                { content: '{?&nbsp;foreach(&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'list' },
                { content: '&nbsp;as&nbsp;', type: 'placeholder' },
                { type: 'var', name: 'item' },
                { content: '&nbsp;):&nbsp;?}', type: 'placeholder' },
            ],
        },
        {
            name: 'endforeach',
            item: 'endforeach;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'cycle',
            icon: 'foreach',
            params: [
                { content: '{?&nbsp;endforeach;&nbsp;?}', type: 'placeholder' },
            ],
        },

    ];

    const getCommands = () => commands || [];
    const getVars = () => editor.getParam('templategeneratorvars') || [];
    const getAll = () => [...getCommands(), ...getVars()];

    editor.ui.registry.addMenuButton('templatebutton', {
        text: 'Команды',
        fetch: (callback) => {
            callback([
                {
                    type: 'nestedmenuitem',
                    text: 'Блочные элементы',
                    getSubmenuItems: () => createMenu('block')
                },
                {
                    type: 'nestedmenuitem',
                    text: 'Элементы в строке',
                    getSubmenuItems: () => createMenu('inline')
                }
            ]);
        }
    });

    // ===== VARS BUTTON =====
    editor.ui.registry.addMenuButton('varsbutton', {
        text: 'Переменные',
        fetch: (callback) => {
            callback(getVars().map(v => ({
                type: 'menuitem',
                text: v.item,
                icon: v.icon || 'variable',
                onAction: () => exec(v, v.type[0])
            })));
        }
    });

    editor.ui.registry.addAutocompleter('customautocomplete', {
        trigger: '@',
        minChars: 0,
        fetch: (pattern) => {
            return Promise.resolve(getAll().filter(v => v.name.startsWith(pattern) || v.item.startsWith(pattern)).map(v => ({
                value: v.name,
                text: v.item + ' (' + v.name + ')'
            })));
        },

        onAction: (api, rng, value) => {
            editor.selection.setRng(rng);
            const cmd = getAll().filter(v => v.name === value)[0];
            exec(cmd, cmd.type[0]);
            // editor.insertContent(value + ' ');
            api.hide();
        }
    });

    function triggerAutocompleter(editor, char = '@') {
        editor.focus();
        // 1. Вставляем триггер в текущую позицию курсора
        editor.execCommand('mceInsertContent', false, char);

        // 2. Генерируем событие клавиатуры (input), чтобы редактор считал триггер
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: char
        });

        editor.getBody().dispatchEvent(inputEvent);
    }

    editor.on('keydown', (e) => {
        if (e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            triggerAutocompleter(editor, '@');
        }
    });

    // ===== DYNAMIC GROUPED BUTTONS =====
    const grouped = {};

    getCommands().forEach(cmd => {
        if (!grouped[cmd.class]) grouped[cmd.class] = [];
        grouped[cmd.class].push(cmd);
    });

    Object.keys(grouped).forEach(group => {

        editor.ui.registry.addMenuButton('templatebutton_' + group, {
            icon: group,
            tooltip: group,
            fetch: (callback) => {

                const items = grouped[group].map(cmd => ({
                    type: 'nestedmenuitem',
                    text: cmd.item,
                    getSubmenuItems: () => [
                        {
                            type: 'menuitem',
                            text: 'Блок',
                            onAction: () => exec(cmd, 'block')
                        },
                        {
                            type: 'menuitem',
                            text: 'В строке',
                            onAction: () => exec(cmd, 'inline')
                        }
                    ]
                }));

                callback(items);
            }
        });

    });

    // ===== HELPERS =====
    function createMenu(type) {
        return getAll()
            .filter(cmd => cmd.type.includes(type))
            .map(cmd => ({
                type: 'menuitem',
                text: cmd.item,
                icon: cmd.icon || 'variable',
                onAction: () => exec(cmd, type)
            }));
    }

    function exec(o, type) {
        // o - обьект, который содержит описание того, что нужно сделать
        // type - тип inline, block

        let tag = 'div';
        let p = editor.selection.getNode();
        if (type == 'inline') {
            tag = 'span';
        }
        else {
            // если находимся в таблице
            if (p.closest('tr')) {
                tag = 'tr';
                p = p.closest('tr');
            }
            else if (p.closest('li')) {
                tag = 'li';
                p = p.closest('li');
            }
            else if (p.closest('p')) {
                tag = 'p';
                p = p.closest('p');
            }
            else if (p.closest('div')) {
                tag = 'div';
                p = p.closest('div');
            }
            else {
                tag = 'p';
            }
        }

        const noPlaceholder = o.params.filter(v => v.type === 'var').length > 0;

        let tagToInsert = Element.fromHtml('<' + tag + ' class="msi-ui-operator ' + o.name + ' ' + type + ' ' + o.class + '" ' + (noPlaceholder ? '' : 'placeholder="' + o.item + '"') + ' contenteditable="false"></' + tag + '>')[0];
        if (tag == 'tr') {
            tagToInsert.append(Element.fromHtml('<td colspan="' + p.querySelectorAll('td').length + '"></td>')[0]);
        }
        o.params.forEach((param) => {
            if (param.type == 'placeholder') {
                // просто текст, не редактируемый
                if (tag == 'tr') {
                    tagToInsert.querySelector('td').append(Element.fromHtml(param.content)[0]);
                }
                else {
                    tagToInsert.append(Element.fromHtml(param.content)[0]);
                }
            }
            else if (param.type == 'var') {
                if (tag == 'tr') {
                    tagToInsert.querySelector('td').append(Element.fromHtml('<span contenteditable="true" class="var" data-var="' + param.name + '"></span>')[0]);
                }
                else {
                    tagToInsert.append(Element.fromHtml('<span contenteditable="true" class="var" data-var="' + param.name + '"></span>'));
                }
            }
        });

        if (tag === 'tr') {
            if (o.create === 'after') {
                p.after(tagToInsert);
            } else if (o.create === 'before') {
                p.before(tagToInsert);
            } else {
                p.replaceWith(tagToInsert);
            }
        } else {
            editor.insertContent(tagToInsert.outerHTML);
            // p.replaceWith(tagToInsert);
        }
    }

    const tb = editor.options.get('toolbar4');

    const buttons = 'templatebutton varsbutton' + Object.keys(grouped).map(v => ' templatebutton_' + v).join(' ');

    if (!tb) {
        editor.options.set('toolbar4', buttons);
    } else if (!tb.includes('templatebutton')) {
        editor.options.set('toolbar4', tb + ' | ' + buttons);
    }

    editor.on('init', () => {
        loadCss(editor.baseURI.toAbsolute("plugins/templategenerator/generator.css"), editor.getDoc());
    });

    editor.on('PreInit', () => {
        const currentMenu = editor.options.get('contextmenu') || '';
        if (!currentMenu.includes('templatescontextmenu')) {
            editor.options.set('contextmenu', currentMenu + ' templatescontextmenu');
        }
    });

    editor.ui.registry.addNestedMenuItem('templatescontextmenu', {
        text: 'Команды',
        getSubmenuItems: () => [
            {
                type: 'nestedmenuitem',
                text: 'Блочные элементы',
                getSubmenuItems: () => createMenu('block')
            },
            {
                type: 'nestedmenuitem',
                text: 'Элементы в строке',
                getSubmenuItems: () => createMenu('inline')
            }
        ]
    });


    return {
        getMetadata: () => ({
            name: 'Template Generator',
            version: '8.0'
        })
    };
});