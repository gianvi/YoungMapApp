
angular.module('your_app_name.filters', [])

.filter('rawHtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])

.filter('truncate', function (){
    return function (text, length, end){
        if (text !== undefined){
            if (isNaN(length)){
                length = 10;
            }

            if (end === undefined){
                end = "...";
            }

            if (text.length <= length || text.length - end.length <= length){
                return text;
            }else{
                return String(text).substring(0, length - end.length) + end;
            }
        }
    };
});
