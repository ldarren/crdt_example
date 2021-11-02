// util script for the example to illustrated worker module usage
function TreeNode(left, right) {
	this.left = left;                                                                                 
	this.right = right;                                                                               
}                                                                                                     
                                                                                                      
function itemCheck(node) {                                                                            
	if (node.left === null) {                                                                         
		return 1;                                                                                     
	}                                                                                                 
	return 1 + itemCheck(node.left) + itemCheck(node.right);                                          
}                                                                                                     
                                                                                                      
function bottomUpTree(depth) {                                                                        
	return depth > 0 ? new TreeNode(bottomUpTree(depth - 1),  bottomUpTree(depth - 1)) : new TreeNode(null, null);         
}
