git fetch -a

for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/); 
do
    git checkout $branch && git pull origin main && git push origin $branch
done
