exports.getDate = function(){
    return new Date().toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    })
}