#!/bin/bash

# ./test.sh test ro git@pagit.paic.com.cn:papuhui/ro_h5.git cba4378931a92a87c754067bbf841300c1d480dc 9d68f3a3ae64b8575cd673e64b715a321cb7a3cc ../

# CFS-SS环境 如：STG1,STG2,STG3,PRODUCTION
ENVIRONMENT="$1"

#模块名 如：ro
MODULENAME="$2"

# GIT工程目录版本仓库地址
GIT_REPO="$3"

# 增量包起始版本
GIT_UPDATE_FROM="$4"

# 增量包终止版本
GIT_UPDATE_TO="$5"

# 工程目录
SRC_DIR="$6"

# 当前保存目录
CURPWD=`pwd`

# 打包空间目录
WORKSPACE='git_upgrade'

# 分支名称
GIT_BRANCH='master'

# 删除打包空间目录，并生成干净的目录
echo '==== [Start]清理工作区间'
rm -fr ${WORKSPACE}
mkdir ${WORKSPACE}
echo '==== [End]清理工作区间'

# 进入打包空间目录
cd ${WORKSPACE}

# clone版本库信息到本地，并切换到指定分支
echo '==== [Start]检出代码'
git clone -b ${GIT_BRANCH} ${GIT_REPO} update_code
git reset --hard ${GIT_UPDATE_TO}
echo '==== [End]检出代码'

# 生成全量包
echo '==== [Start]生成全量包'
gulp auto-build -env ${ENVIRONMENT} -chdir ${WORKSPACE}/update_code -mod ${MODULENAME}
echo '==== [End]生成全量包'



exit

# git diff --name-only ${GIT_UPDATE_FROM} ${GIT_UPDATE_TO} ${SRC_DIR} | xargs zip update.zip
git diff --name-only ${GIT_UPDATE_FROM} ${GIT_UPDATE_TO} ${SRC_DIR} > filelist

git clone ${GIT_REPO} update
while read file
do
    # git_file=${GIT_REPO}/$file
    # git remote add –f ${GIT_REPO}/$file ${git_file}
    echo ${git_file}
done < filelist
