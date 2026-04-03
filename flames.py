def finalize_flames(count_lenth) :
    flames = ["F", "L", "A", "M", "E", "S"]
    index = 0
    while len(flames) > 1 :
        index = (index + count_lenth -1) % len(flames) 
        
        index.pop()
    return flames[0]






Boy_Name =  input("Enter Your Name :") 
Girl_Name = input("Enter Your Partner Name : ")     

count_lenth = len(Boy_Name) + len(Girl_Name) 

for i in range(len(Boy_Name)-1, -1, -1) :
    for j in range(len(Girl_Name)-1, -1, -1) :
        if Boy_Name[i] == Girl_Name[j] :
            Boy_Name = Boy_Name.replace(Boy_Name[i], "", 1)
            Girl_Name = Girl_Name.replace(Girl_Name[j], "", 1)
            break 

print(Boy_Name)
print(Girl_Name)
count_lenth = len(Boy_Name) + len(Girl_Name) 

 
result = finalize_flames(count_lenth)
if result == "F" :
    print("You are Friends")    
elif result == "L" :
    print("You are Lovers") 
elif result == "A" :
    print("You are Affectionate")
elif result == "M" :
    print("You are Married")
elif result == "E" :
    print("You are Enemies")
else :
    print("You are Siblings")

print("Your FLAMES result is : ", result)
        